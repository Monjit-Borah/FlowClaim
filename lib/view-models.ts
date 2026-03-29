import {
  ApprovalDecision,
  ApprovalRequestState,
  ClaimStatus,
  FraudLevel,
  NotificationType,
  PolicySeverity,
  Prisma
} from "@prisma/client";

import { AnalyticsSnapshot, ExpenseClaim, ManagerApprovalItem, NotificationItem, PolicyRule, WorkflowTemplate } from "@/lib/types";

type ClaimWithRelations = Prisma.ExpenseClaimGetPayload<{
  include: {
    employee: { include: { employeeProfile: { include: { department: true } } } };
    receipts: { include: { ocrExtraction: true } };
    fraudFlags: true;
    approvalActions: { include: { actor: true } };
    approvalRequests: { include: { approver: true } };
    lineItems: true;
  };
}>;

type ApprovalRequestWithRelations = Prisma.ApprovalRequestGetPayload<{
  include: {
    claim: {
      include: {
        employee: { include: { employeeProfile: { include: { department: true } } } };
        receipts: { include: { ocrExtraction: true } };
        fraudFlags: true;
      };
    };
  };
}>;

export function mapClaimStatus(status: ClaimStatus): ExpenseClaim["status"] {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ") as ExpenseClaim["status"];
}

function mapDecision(decision: ApprovalDecision): ExpenseClaim["approvalActions"][number]["decision"] {
  return decision;
}

function mapFraudLevel(level: FraudLevel) {
  return level as ExpenseClaim["fraudFlags"][number]["level"];
}

export function mapClaimToView(claim: ClaimWithRelations): ExpenseClaim {
  const receipt = claim.receipts[0];
  return {
    id: claim.id,
    employeeId: claim.employeeId,
    employeeName: claim.employee.name,
    managerName: claim.employee.employeeProfile?.managerUserId ?? "Unassigned",
    department: claim.employee.employeeProfile?.department?.name ?? "Unassigned",
    category: claim.category,
    amount: claim.amount,
    currency: claim.currency,
    convertedAmount: claim.convertedAmount,
    companyCurrency: claim.companyCurrency,
    expenseDate: claim.expenseDate.toISOString().slice(0, 10),
    vendor: claim.merchant,
    description: claim.description,
    notes: claim.notes ?? undefined,
    international: claim.isInternational,
    status: mapClaimStatus(claim.status),
    createdAt: claim.createdAt.toISOString(),
    updatedAt: claim.updatedAt.toISOString(),
    riskScore: claim.riskScore,
    aiSummary: claim.aiSummary ?? "No AI summary available yet.",
    similarInsight: claim.similarInsight ?? "No similar-claim insight has been computed yet.",
    receipt: receipt
      ? {
          id: receipt.id,
          claimId: claim.id,
          fileName: receipt.fileName,
          fileUrl: receipt.fileUrl,
          uploadedAt: receipt.createdAt.toISOString(),
          ocr: receipt.ocrExtraction
            ? {
                merchant: receipt.ocrExtraction.merchant ?? "",
                amount: receipt.ocrExtraction.amount ?? 0,
                tax: receipt.ocrExtraction.tax ?? 0,
                date: receipt.ocrExtraction.date?.toISOString().slice(0, 10) ?? "",
                currency: receipt.ocrExtraction.currency ?? claim.currency,
                suggestedCategory: receipt.ocrExtraction.suggestedCategory ?? claim.category,
                confidence: receipt.ocrExtraction.confidence ?? 0,
                lineItems: Array.isArray(receipt.ocrExtraction.lineItems)
                  ? (receipt.ocrExtraction.lineItems as unknown as NonNullable<NonNullable<ExpenseClaim["receipt"]>["ocr"]>["lineItems"])
                  : claim.lineItems.map((item) => ({
                      id: item.id,
                      label: item.label,
                      amount: item.amount
                    })),
                lowConfidenceFields: Array.isArray(receipt.ocrExtraction.lowConfidenceKeys)
                  ? (receipt.ocrExtraction.lowConfidenceKeys as string[])
                  : []
              }
            : undefined
        }
      : undefined,
    policyViolations: [],
    fraudFlags: claim.fraudFlags.map((flag) => ({
      id: flag.id,
      title: flag.title,
      description: flag.description,
      level: mapFraudLevel(flag.level),
      score: flag.score
    })),
    approvalActions: claim.approvalActions.map((action) => ({
      id: action.id,
      stepName: action.stepName,
      actorName: action.actor.name,
      decision: mapDecision(action.decision),
      comment: action.comment ?? "",
      createdAt: action.createdAt.toISOString()
    })),
    approvalRequests: claim.approvalRequests.map((request) => ({
      id: request.id,
      claimId: claim.id,
      approverId: request.approverId,
      stepName: request.stepName,
      approverName: request.approver.name,
      approverRole: request.approverRole as ExpenseClaim["approvalRequests"][number]["approverRole"],
      state: request.state === ApprovalRequestState.PENDING ? "PENDING" : "DONE"
    })),
    timeline: [
      {
        title: `Status: ${mapClaimStatus(claim.status)}`,
        timestamp: claim.updatedAt.toISOString(),
        detail: claim.aiSummary ?? "Claim updated"
      },
      ...claim.approvalActions.map((action) => ({
        title: mapDecision(action.decision),
        timestamp: action.createdAt.toISOString(),
        detail: `${action.actor.name} · ${action.comment ?? "No comment"}`
      }))
    ]
  };
}

export function mapManagerApprovalToView(approval: ApprovalRequestWithRelations): ManagerApprovalItem {
  const receipt = approval.claim.receipts[0];
  const submittedAt = approval.claim.createdAt;

  return {
    approvalRequestId: approval.id,
    claimId: approval.claimId,
    stepName: approval.stepName,
    approverRole: approval.approverRole as ManagerApprovalItem["approverRole"],
    employeeName: approval.claim.employee.name,
    department: approval.claim.employee.employeeProfile?.department?.name ?? "Unassigned",
    vendor: approval.claim.merchant,
    description: approval.claim.description,
    amount: approval.claim.convertedAmount,
    companyCurrency: approval.claim.companyCurrency,
    status: mapClaimStatus(approval.claim.status),
    riskScore: approval.claim.riskScore,
    fraudCount: approval.claim.fraudFlags.length,
    hasReceipt: approval.claim.receipts.length > 0,
    ocrConfidence: receipt?.ocrExtraction?.confidence ?? undefined,
    submittedAt: submittedAt.toISOString(),
    expenseDate: approval.claim.expenseDate.toISOString().slice(0, 10),
    agingDays: Math.max(0, Math.ceil((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)))
  };
}

export function mapWorkflowTemplate(template: Prisma.ApprovalWorkflowTemplateGetPayload<{ include: { steps: true } }>): WorkflowTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    trigger: template.trigger ?? "",
    mode: template.mode as WorkflowTemplate["mode"],
    steps: template.steps
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((step) => ({
        id: step.id,
        name: step.name,
        approverType: step.approverType as WorkflowTemplate["steps"][number]["approverType"],
        specificUserId: step.specificUserId ?? undefined,
        mode: step.mode as WorkflowTemplate["steps"][number]["mode"],
        minApprovalPercent: step.minApprovalPercent ?? undefined,
        overrideAutoApprove: step.overrideAutoApprove,
        conditionChip: step.conditionChip ?? ""
      }))
  };
}

export function mapPolicyRule(rule: Prisma.PolicyRuleGetPayload<{}>): PolicyRule {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    severity: rule.severity as PolicyRule["severity"],
    category: rule.category ?? undefined,
    threshold: rule.threshold ?? undefined
  };
}

export function mapNotification(notification: Prisma.NotificationGetPayload<{}>): NotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    description: notification.description,
    time: notification.createdAt.toISOString(),
    type: notification.type as NotificationType,
    audience: "ALL"
  };
}

export function computeAnalytics(claims: ClaimWithRelations[], scopeLabel = "Total"): AnalyticsSnapshot {
  const totalSpend = claims.reduce((sum, claim) => sum + claim.convertedAmount, 0);
  const approved = claims.filter((claim) => claim.status === "APPROVED" || claim.status === "PAID" || claim.status === "IN_PAYMENT_QUEUE").length;
  const rejected = claims.filter((claim) => claim.status === "REJECTED").length;
  const pending = claims.filter((claim) => String(claim.status).startsWith("PENDING")).length;

  const monthlyMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const departmentMap = new Map<string, number>();

  for (const claim of claims) {
    const month = claim.createdAt.toLocaleString("en-US", { month: "short" });
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + claim.convertedAmount);
    categoryMap.set(claim.category, (categoryMap.get(claim.category) ?? 0) + claim.convertedAmount);
    const department = claim.employee.employeeProfile?.department?.name ?? "Unassigned";
    departmentMap.set(department, (departmentMap.get(department) ?? 0) + claim.convertedAmount);
  }

  return {
    kpis: [
      { label: `${scopeLabel} spend`, value: `$${Math.round(totalSpend)}`, delta: `${claims.length} claims` },
      { label: "Approval rate", value: `${claims.length ? Math.round((approved / claims.length) * 100) : 0}%`, delta: `${approved} approved` },
      { label: "Rejection rate", value: `${claims.length ? Math.round((rejected / claims.length) * 100) : 0}%`, delta: `${rejected} rejected` },
      { label: "Pending", value: `${pending}`, delta: `${claims.length - pending} processed` }
    ],
    monthlySpend: [...monthlyMap.entries()].map(([month, value]) => ({ month, value })),
    categorySpend: [...categoryMap.entries()].map(([name, value]) => ({ name, value })),
    departmentSpend: [...departmentMap.entries()].map(([name, value]) => ({ name, value }))
  };
}
