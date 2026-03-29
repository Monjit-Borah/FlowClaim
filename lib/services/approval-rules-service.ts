import { WorkflowMode } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/services/audit-service";
import { assignManager, updateUserRole } from "@/lib/services/user-service";

type SerializedApprovalRule = {
  version: 1;
  targetUserId: string;
  category: string;
  managerId: string | null;
  managerFirst: boolean;
  sequential: boolean;
  minimumApprovalPercent: number;
  specialApproverId: string | null;
  approvers: Array<{
    userId: string;
    required: boolean;
  }>;
};

export type ApprovalRuleRow = {
  id: string;
  name: string;
  email: string;
  roleKey: "EMPLOYEE" | "MANAGER";
  managerId: string | null;
  managerName: string | null;
  ruleCategory: string;
  config: SerializedApprovalRule;
};

export type ApprovalRuleOption = {
  id: string;
  name: string;
  email: string;
};

function createDefaultConfig(userId: string, managerId: string | null): SerializedApprovalRule {
  return {
    version: 1,
    targetUserId: userId,
    category: "Miscellaneous Expenses",
    managerId,
    managerFirst: Boolean(managerId),
    sequential: true,
    minimumApprovalPercent: 60,
    specialApproverId: null,
    approvers: []
  };
}

function parseSerializedRule(expression: string | null, userId: string, managerId: string | null) {
  if (!expression) {
    return createDefaultConfig(userId, managerId);
  }

  try {
    const parsed = JSON.parse(expression) as Partial<SerializedApprovalRule>;
    return {
      ...createDefaultConfig(userId, managerId),
      ...parsed,
      targetUserId: userId,
      managerId: parsed.managerId ?? managerId ?? null,
      approvers: Array.isArray(parsed.approvers)
        ? parsed.approvers.filter(
            (approver): approver is SerializedApprovalRule["approvers"][number] =>
              Boolean(approver?.userId) && typeof approver.required === "boolean"
          )
        : []
    };
  } catch {
    return createDefaultConfig(userId, managerId);
  }
}

export async function listApprovalRulesWorkspace(companyId: string) {
  const [users, managers, templates] = await Promise.all([
    prisma.user.findMany({
      where: {
        companyId,
        role: {
          key: {
            in: ["EMPLOYEE", "MANAGER"]
          }
        }
      },
      include: {
        role: true,
        employeeProfile: {
          include: {
            manager: true
          }
        }
      },
      orderBy: [{ role: { key: "asc" } }, { name: "asc" }]
    }),
    prisma.user.findMany({
      where: {
        companyId,
        role: {
          key: "MANAGER"
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.approvalWorkflowTemplate.findMany({
      where: { companyId },
      include: { rules: true, steps: true }
    })
  ]);

  const templateByUserId = new Map<string, (typeof templates)[number]>();
  for (const template of templates) {
    const targetRule = template.rules.find((rule) => rule.name.startsWith("USER_RULE:"));
    if (!targetRule) continue;
    const [, targetUserId] = targetRule.name.split(":");
    if (targetUserId) {
      templateByUserId.set(targetUserId, template);
    }
  }

  const rows: ApprovalRuleRow[] = users.map((user) => {
    const template = templateByUserId.get(user.id);
    const targetRule = template?.rules.find((rule) => rule.name.startsWith(`USER_RULE:${user.id}`)) ?? null;
    const config = parseSerializedRule(targetRule?.expression ?? null, user.id, user.employeeProfile?.managerUserId ?? null);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleKey: user.role.key as ApprovalRuleRow["roleKey"],
      managerId: config.managerId ?? user.employeeProfile?.managerUserId ?? null,
      managerName:
        managers.find((manager) => manager.id === (config.managerId ?? user.employeeProfile?.managerUserId ?? null))?.name ??
        user.employeeProfile?.manager?.name ??
        null,
      ruleCategory: config.category,
      config
    };
  });

  const managerOptions: ApprovalRuleOption[] = managers.map((manager) => ({
    id: manager.id,
    name: manager.name,
    email: manager.email
  }));

  const approverOptions: ApprovalRuleOption[] = [
    ...managers,
    ...(await prisma.user.findMany({
      where: {
        companyId,
        role: { key: "ADMIN" }
      },
      orderBy: { name: "asc" }
    }))
  ]
    .filter((user, index, list) => list.findIndex((candidate) => candidate.id === user.id) === index)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));

  return {
    rows,
    managerOptions,
    approverOptions
  };
}

export async function saveApprovalRuleConfig(input: {
  companyId: string;
  actorId: string;
  userId: string;
  roleKey: "EMPLOYEE" | "MANAGER";
  managerId: string | null;
  category: string;
  managerFirst: boolean;
  sequential: boolean;
  minimumApprovalPercent: number;
  specialApproverId: string | null;
  approvers: Array<{
    userId: string;
    required: boolean;
  }>;
}) {
  await updateUserRole(input.userId, input.roleKey);

  if (input.managerId) {
    await assignManager(input.userId, input.managerId, input.companyId);
  }

  const targetUser = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId }
  });

  const serialized: SerializedApprovalRule = {
    version: 1,
    targetUserId: input.userId,
    category: input.category,
    managerId: input.managerId,
    managerFirst: input.managerFirst,
    sequential: input.sequential,
    minimumApprovalPercent: input.minimumApprovalPercent,
    specialApproverId: input.specialApproverId,
    approvers: input.approvers
  };

  const existingTemplate = await prisma.approvalWorkflowTemplate.findFirst({
    where: {
      companyId: input.companyId,
      rules: {
        some: {
          name: `USER_RULE:${input.userId}:${input.category}`
        }
      }
    },
    include: { steps: true, rules: true }
  });

  const approverUsers = await prisma.user.findMany({
    where: {
      id: {
        in: [
          ...input.approvers.map((approver) => approver.userId),
          ...(input.managerFirst && input.managerId ? [input.managerId] : []),
          ...(input.specialApproverId ? [input.specialApproverId] : [])
        ]
      }
    }
  });

  const approverById = new Map(approverUsers.map((user) => [user.id, user]));
  const orderedApprovers = [
    ...(input.managerFirst && input.managerId
      ? [
          {
            userId: input.managerId,
            required: true,
            type: "MANAGER" as const
          }
        ]
      : []),
    ...input.approvers.map((approver) => ({
      ...approver,
      type: approver.userId === input.specialApproverId ? ("CFO" as const) : ("SPECIFIC_USER" as const)
    }))
  ];

  const templateData = {
    companyId: input.companyId,
    name: `Approval Rule · ${targetUser.name} · ${input.category}`,
    description: `Dynamic approval rule for ${targetUser.name}`,
    trigger: input.category,
    mode: input.sequential ? WorkflowMode.SEQUENTIAL : WorkflowMode.PARALLEL
  };

  const stepData = orderedApprovers.map((approver, index) => ({
    name: `${index + 1}. ${approverById.get(approver.userId)?.name ?? "Approver"}`,
    approverType: approver.type,
    specificUserId: approver.userId,
    orderIndex: index,
    mode: input.sequential ? WorkflowMode.SEQUENTIAL : WorkflowMode.PARALLEL,
    minApprovalPercent: input.minimumApprovalPercent,
    overrideAutoApprove: approver.userId === input.specialApproverId,
    conditionChip: approver.required ? "Required" : "Optional"
  }));

  const workflow = existingTemplate
    ? await prisma.approvalWorkflowTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          ...templateData,
          steps: {
            deleteMany: {},
            create: stepData
          },
          rules: {
            deleteMany: {},
            create: {
              name: `USER_RULE:${input.userId}:${input.category}`,
              expression: JSON.stringify(serialized),
              threshold: input.minimumApprovalPercent / 100,
              category: input.category,
              specificApprover: input.specialApproverId,
              requiresFinance: input.approvers.some(
                (approver) => approverById.get(approver.userId)?.email.toLowerCase().includes("finance")
              )
            }
          }
        },
        include: { steps: true, rules: true }
      })
    : await prisma.approvalWorkflowTemplate.create({
        data: {
          ...templateData,
          steps: {
            create: stepData
          },
          rules: {
            create: {
              name: `USER_RULE:${input.userId}:${input.category}`,
              expression: JSON.stringify(serialized),
              threshold: input.minimumApprovalPercent / 100,
              category: input.category,
              specificApprover: input.specialApproverId,
              requiresFinance: input.approvers.some(
                (approver) => approverById.get(approver.userId)?.email.toLowerCase().includes("finance")
              )
            }
          }
        },
        include: { steps: true, rules: true }
      });

  await createAuditLog({
    companyId: input.companyId,
    actorId: input.actorId,
    action: "APPROVAL_RULE_UPDATED",
    target: input.userId,
    detail: `${targetUser.name} · ${input.category} · ${input.sequential ? "Sequential" : "Parallel"} · ${input.minimumApprovalPercent}%`
  });

  return workflow;
}
