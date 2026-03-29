import { ApprovalRequestState, ClaimStatus, Prisma, WorkflowMode } from "@prisma/client";

import { prisma } from "@/lib/db";
import { mapWorkflowTemplate } from "@/lib/view-models";

export async function listWorkflowTemplates(companyId: string) {
  const templates = await prisma.approvalWorkflowTemplate.findMany({
    where: { companyId },
    include: { steps: true },
    orderBy: { createdAt: "asc" }
  });
  return templates.map(mapWorkflowTemplate);
}

export async function selectWorkflowForClaim(input: {
  companyId: string;
  convertedAmount: number;
  isInternational: boolean;
  category: string;
}) {
  const templates = await prisma.approvalWorkflowTemplate.findMany({
    where: { companyId: input.companyId },
    include: { steps: true, rules: true }
  });

  const exactInternational = templates.find(
    (template) =>
      template.rules.some((rule) => rule.country && input.isInternational) ||
      /international/i.test(template.name)
  );
  if (exactInternational && input.category === "Travel") return exactInternational;

  return (
    templates.find((template) =>
      template.rules.some((rule) => {
        const minOk = rule.amountMin == null || input.convertedAmount >= rule.amountMin;
        const maxOk = rule.amountMax == null || input.convertedAmount <= rule.amountMax;
        const categoryOk = !rule.category || rule.category === input.category;
        return minOk && maxOk && categoryOk;
      })
    ) ?? templates[0] ?? null
  );
}

export function evaluateApprovalRule(options: {
  approvals: number;
  approvers: number;
  cfoApproved?: boolean;
  threshold?: number;
}) {
  const approvalRate = options.approvals / Math.max(options.approvers, 1);
  return {
    approvalRate,
    approvedByPercent: approvalRate >= (options.threshold ?? 0.6),
    approvedByCfo: Boolean(options.cfoApproved),
    finalApproved: approvalRate >= (options.threshold ?? 0.6) || Boolean(options.cfoApproved)
  };
}

async function resolveApprovers(claim: Prisma.ExpenseClaimGetPayload<{ include: { employee: { include: { employeeProfile: true } } } }>, step: Prisma.ApprovalWorkflowStepGetPayload<{}>) {
  if (step.specificUserId) {
    return [step.specificUserId];
  }

  if (step.approverType === "MANAGER" && claim.employee.employeeProfile?.managerUserId) {
    return [claim.employee.employeeProfile.managerUserId];
  }

  const roleKey =
    step.approverType === "FINANCE"
      ? "ADMIN"
      : step.approverType === "DIRECTOR"
        ? "MANAGER"
        : step.approverType === "CFO"
          ? "ADMIN"
          : "MANAGER";

  const users = await prisma.user.findMany({
    where: {
      companyId: claim.companyId,
      role: { key: roleKey }
    },
    take: step.mode === WorkflowMode.PARALLEL ? 3 : 1
  });

  return users.map((user) => user.id);
}

export async function attachWorkflowToClaim(claimId: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { id: claimId },
    include: {
      employee: {
        include: {
          employeeProfile: true
        }
      }
    }
  });
  if (!claim) throw new Error("Claim not found");

  const template = await selectWorkflowForClaim({
    companyId: claim.companyId,
    convertedAmount: claim.convertedAmount,
    isInternational: claim.isInternational,
    category: claim.category
  });

  if (!template) {
    return null;
  }

  const steps = await prisma.approvalWorkflowStep.findMany({
    where: { templateId: template.id },
    orderBy: { orderIndex: "asc" }
  });

  const firstStep = steps[0];
  if (!firstStep) return template;

  const approverIds = await resolveApprovers(claim, firstStep);
  await prisma.expenseClaim.update({
    where: { id: claimId },
    data: {
      workflowTemplateId: template.id,
      status:
        firstStep.approverType === "FINANCE"
          ? ClaimStatus.PENDING_FINANCE_APPROVAL
          : firstStep.approverType === "DIRECTOR"
            ? ClaimStatus.PENDING_DIRECTOR_APPROVAL
            : ClaimStatus.PENDING_MANAGER_APPROVAL
    }
  });

  await prisma.approvalRequest.createMany({
    data: approverIds.map((approverId) => ({
      claimId,
      approverId,
      stepName: firstStep.name,
      approverRole: firstStep.approverType,
      state: ApprovalRequestState.PENDING
    }))
  });

  return template;
}
