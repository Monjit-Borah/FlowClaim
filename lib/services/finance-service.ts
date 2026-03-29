import { ClaimStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/services/audit-service";
import { createNotification } from "@/lib/services/notification-service";

export async function getPaymentQueue(companyId: string) {
  return prisma.reimbursementPayment.findMany({
    where: { claim: { companyId } },
    include: {
      claim: { include: { employee: true } },
      processor: true
    },
    orderBy: { queuedAt: "desc" }
  });
}

export async function markPaid(input: {
  paymentId: string;
  processorId: string;
  payoutReference: string;
}) {
  const existing = await prisma.reimbursementPayment.findUniqueOrThrow({
    where: { id: input.paymentId },
    include: {
      claim: {
        include: {
          employee: true,
          company: true
        }
      }
    }
  });

  const payment = await prisma.reimbursementPayment.update({
    where: { id: input.paymentId },
    data: {
      status: "PAID",
      processorId: input.processorId,
      payoutReference: input.payoutReference,
      paidAt: new Date()
    },
    include: {
      claim: {
        include: {
          employee: true,
          company: true
        }
      }
    }
  });

  await prisma.expenseClaim.update({
    where: { id: existing.claimId },
    data: { status: ClaimStatus.PAID }
  });

  await createNotification({
    companyId: payment.claim.companyId,
    userId: payment.claim.employeeId,
    type: "PAID",
    title: "Reimbursement paid",
    description: `${payment.claim.merchant} has been marked paid.`
  });

  await createAuditLog({
    companyId: payment.claim.companyId,
    actorId: input.processorId,
    action: "Reimbursement marked paid",
    target: payment.claim.id,
    detail: `Payout reference ${input.payoutReference}`
  });

  return payment;
}
