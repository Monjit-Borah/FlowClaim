import { ApprovalDecision, ApprovalRequestState, ClaimStatus, NotificationType, WorkflowMode } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/services/audit-service";
import { createNotification } from "@/lib/services/notification-service";
import { evaluateApprovalRule } from "@/lib/services/workflow-engine";

async function moveClaimForward(claimId: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { id: claimId },
    include: {
      company: true,
      workflowTemplate: {
        include: { steps: true }
      },
      approvalActions: true,
      approvalRequests: true
    }
  });
  if (!claim || !claim.workflowTemplate) return null;

  const completedStepName = claim.approvalRequests[0]?.stepName ?? null;
  const steps = [...claim.workflowTemplate.steps].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIndex = steps.findIndex((step) => step.name === completedStepName);
  const nextStep = steps[currentIndex + 1];

  if (!nextStep) {
    await prisma.expenseClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.APPROVED }
    });

    await prisma.reimbursementPayment.upsert({
      where: { claimId },
      update: { status: "QUEUED" },
      create: {
        claimId,
        amount: claim.convertedAmount,
        currency: claim.companyCurrency,
        status: "QUEUED"
      }
    });

    await prisma.expenseClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.IN_PAYMENT_QUEUE }
    });

    await createNotification({
      companyId: claim.companyId,
      userId: claim.employeeId,
      type: NotificationType.APPROVED,
      title: "Claim approved",
      description: `${claim.merchant} moved to payout queue.`
    });
    return claim;
  }

  const approvers = await prisma.user.findMany({
    where: {
      companyId: claim.companyId,
      role: {
        key: nextStep.approverType === "FINANCE" || nextStep.approverType === "CFO" ? "ADMIN" : "MANAGER"
      }
    },
    take: nextStep.mode === WorkflowMode.PARALLEL ? 3 : 1
  });

  await prisma.approvalRequest.createMany({
    data: approvers.map((approver) => ({
      claimId,
      approverId: approver.id,
      stepName: nextStep.name,
      approverRole: nextStep.approverType,
      state: ApprovalRequestState.PENDING
    }))
  });

  await prisma.expenseClaim.update({
    where: { id: claimId },
    data: {
      status:
        nextStep.approverType === "FINANCE"
          ? ClaimStatus.PENDING_FINANCE_APPROVAL
          : nextStep.approverType === "DIRECTOR"
            ? ClaimStatus.PENDING_DIRECTOR_APPROVAL
            : ClaimStatus.PENDING_CONDITIONAL_APPROVAL
    }
  });

  return claim;
}

export async function getPendingApprovals(userId: string) {
  return prisma.approvalRequest.findMany({
    where: { approverId: userId, state: ApprovalRequestState.PENDING },
    include: {
      claim: {
        include: {
          employee: true,
          receipts: true,
          fraudFlags: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function applyApprovalAction(input: {
  approvalRequestId: string;
  actorId: string;
  decision: ApprovalDecision;
  comment?: string;
}) {
  const approval = await prisma.approvalRequest.update({
    where: { id: input.approvalRequestId },
    data: {
      state: ApprovalRequestState.DONE,
      completedAt: new Date()
    },
    include: {
      claim: {
        include: {
          workflowTemplate: {
            include: { steps: true }
          },
          approvalRequests: true,
          company: true
        }
      },
      approver: true
    }
  });

  await prisma.approvalAction.create({
    data: {
      claimId: approval.claimId,
      actorId: input.actorId,
      stepName: approval.stepName,
      decision: input.decision,
      comment: input.comment
    }
  });

  if (input.decision === ApprovalDecision.REJECTED) {
    await prisma.expenseClaim.update({
      where: { id: approval.claimId },
      data: { status: ClaimStatus.REJECTED }
    });
  } else if (input.decision === ApprovalDecision.SENT_BACK) {
    await prisma.expenseClaim.update({
      where: { id: approval.claimId },
      data: { status: ClaimStatus.SENT_BACK }
    });
  } else if (input.decision === ApprovalDecision.ESCALATED) {
    await prisma.expenseClaim.update({
      where: { id: approval.claimId },
      data: { status: ClaimStatus.ESCALATED }
    });
  } else {
    const sameStepRequests = await prisma.approvalRequest.findMany({
      where: { claimId: approval.claimId, stepName: approval.stepName }
    });

    const sameStepApprovals = await prisma.approvalAction.findMany({
      where: { claimId: approval.claimId, stepName: approval.stepName, decision: ApprovalDecision.APPROVED }
    });

    const currentStep = approval.claim.workflowTemplate?.steps.find((step) => step.name === approval.stepName);
    const ruleResult = evaluateApprovalRule({
      approvals: sameStepApprovals.length,
      approvers: sameStepRequests.length,
      cfoApproved: currentStep?.approverType === "CFO" && input.decision === ApprovalDecision.APPROVED,
      threshold: currentStep?.minApprovalPercent ? currentStep.minApprovalPercent / 100 : 0.6
    });

    if (
      sameStepRequests.every((request) => request.state !== ApprovalRequestState.PENDING) &&
      (ruleResult.finalApproved || sameStepRequests.length === 1)
    ) {
      await moveClaimForward(approval.claimId);
    }
  }

  await createNotification({
    companyId: approval.claim.companyId,
    userId: approval.claim.employeeId,
    type:
      input.decision === ApprovalDecision.APPROVED
        ? NotificationType.APPROVED
        : input.decision === ApprovalDecision.REJECTED
          ? NotificationType.REJECTED
          : input.decision === ApprovalDecision.SENT_BACK
            ? NotificationType.SENT_BACK
            : NotificationType.ESCALATED,
    title: `Claim ${input.decision.toLowerCase().replace("_", " ")}`,
    description: `${approval.claim.merchant} was updated by ${approval.approver.name}.`
  });

  await createAuditLog({
    companyId: approval.claim.companyId,
    actorId: input.actorId,
    action: `Approval ${input.decision}`,
    target: approval.claimId,
    detail: input.comment ?? "No comment"
  });

  return approval;
}
