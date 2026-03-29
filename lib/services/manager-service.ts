import { ApprovalDecision, ApprovalRequestState, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { applyApprovalAction } from "@/lib/services/approval-service";
import { mapClaimStatus } from "@/lib/view-models";

type ManagerRequestRecord = Prisma.ApprovalRequestGetPayload<{
  include: {
    claim: {
      include: {
        employee: true;
        receipts: { include: { ocrExtraction: true } };
        fraudFlags: true;
      };
    };
  };
}>;

export type ManagerRequestResponse = {
  id: string;
  employee: string;
  amount: number;
  category: string;
  status: string;
  receipt_url: string | null;
  risk_score: number;
  ai_suggestion: string;
  duplicate_flag: boolean;
};

export function calculateRisk(claim: ManagerRequestRecord["claim"], duplicateFlag: boolean) {
  const confidence = claim.receipts[0]?.ocrExtraction?.confidence ?? 1;
  let score = Math.max(claim.riskScore, claim.fraudFlags.length ? 35 : 20);

  if (duplicateFlag) score = Math.max(score, 84);
  if (claim.amount >= 5000) score = Math.max(score, 72);
  if (!claim.receipts.length) score += 14;
  if (confidence < 0.8) score += 12;

  return Math.min(100, Math.round(score));
}

export async function checkDuplicate(claim: ManagerRequestRecord["claim"]) {
  if (claim.fraudFlags.some((flag) => /duplicate/i.test(flag.title) || /duplicate/i.test(flag.description))) {
    return true;
  }

  const duplicate = await prisma.expenseClaim.findFirst({
    where: {
      companyId: claim.companyId,
      id: { not: claim.id },
      merchant: claim.merchant,
      amount: claim.amount,
      expenseDate: claim.expenseDate
    },
    select: { id: true }
  });

  return Boolean(duplicate);
}

export function getAISuggestion(input: {
  riskScore: number;
  duplicateFlag: boolean;
  hasReceipt: boolean;
  ocrConfidence?: number | null;
}) {
  if (input.duplicateFlag) {
    return "Reject or escalate for duplicate review.";
  }

  if (!input.hasReceipt) {
    return "Request receipt before approval.";
  }

  if ((input.ocrConfidence ?? 1) < 0.8 || input.riskScore >= 70) {
    return "Needs manual review before approval.";
  }

  if (input.riskScore >= 50) {
    return "Approve with comment after manager review.";
  }

  return "Safe to approve.";
}

async function mapManagerRequest(record: ManagerRequestRecord): Promise<ManagerRequestResponse> {
  const duplicateFlag = await checkDuplicate(record.claim);
  const riskScore = calculateRisk(record.claim, duplicateFlag);
  const aiSuggestion = getAISuggestion({
    riskScore,
    duplicateFlag,
    hasReceipt: record.claim.receipts.length > 0,
    ocrConfidence: record.claim.receipts[0]?.ocrExtraction?.confidence
  });

  return {
    id: record.claim.id,
    employee: record.claim.employee.name,
    amount: record.claim.convertedAmount,
    category: record.claim.category,
    status: mapClaimStatus(record.claim.status),
    receipt_url: record.claim.receipts[0]?.fileUrl ?? null,
    risk_score: riskScore,
    ai_suggestion: aiSuggestion,
    duplicate_flag: duplicateFlag
  };
}

async function findManagerRequestRecord(input: {
  actorId: string;
  companyId: string;
  id: string;
  pendingOnly?: boolean;
}) {
  return prisma.approvalRequest.findFirst({
    where: {
      approverId: input.actorId,
      claim: {
        companyId: input.companyId
      },
      ...(input.pendingOnly === false ? {} : { state: ApprovalRequestState.PENDING }),
      OR: [{ id: input.id }, { claimId: input.id }]
    },
    include: {
      claim: {
        include: {
          employee: true,
          receipts: { include: { ocrExtraction: true } },
          fraudFlags: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function listManagerRequests(actorId: string, companyId: string) {
  const records = await prisma.approvalRequest.findMany({
    where: {
      approverId: actorId,
      state: ApprovalRequestState.PENDING,
      claim: {
        companyId
      }
    },
    include: {
      claim: {
        include: {
          employee: true,
          receipts: { include: { ocrExtraction: true } },
          fraudFlags: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return Promise.all(records.map(mapManagerRequest));
}

export async function getManagerRequestById(actorId: string, companyId: string, id: string) {
  const record = await findManagerRequestRecord({
    actorId,
    companyId,
    id
  });

  if (!record) return null;
  return mapManagerRequest(record);
}

export async function runManagerDecision(input: {
  actorId: string;
  companyId: string;
  id: string;
  decision: ApprovalDecision;
  comment?: string;
}) {
  const approval = await findManagerRequestRecord({
    actorId: input.actorId,
    companyId: input.companyId,
    id: input.id
  });

  if (!approval) {
    throw new Error("Manager request not found.");
  }

  await applyApprovalAction({
    approvalRequestId: approval.id,
    actorId: input.actorId,
    decision: input.decision,
    comment: input.comment
  });

  const updatedRecord = await findManagerRequestRecord({
    actorId: input.actorId,
    companyId: input.companyId,
    id: approval.id,
    pendingOnly: false
  });

  if (!updatedRecord) {
    throw new Error("Updated manager request could not be loaded.");
  }

  return mapManagerRequest(updatedRecord);
}
