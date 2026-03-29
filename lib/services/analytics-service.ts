import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { computeAnalytics } from "@/lib/view-models";

async function fetchClaimsForAnalytics(where: Prisma.ExpenseClaimWhereInput) {
  return prisma.expenseClaim.findMany({
    where,
    include: {
      employee: { include: { employeeProfile: { include: { department: true } } } },
      receipts: { include: { ocrExtraction: true } },
      fraudFlags: true,
      approvalActions: { include: { actor: true } },
      approvalRequests: { include: { approver: true } },
      lineItems: true
    }
  });
}

export async function getAdminAnalytics(companyId: string) {
  const claims = await fetchClaimsForAnalytics({ companyId });
  return computeAnalytics(claims, "Total");
}

export async function getManagerAnalytics(companyId: string, managerId: string) {
  const claims = await fetchClaimsForAnalytics({
    companyId,
    employee: {
      employeeProfile: {
        managerUserId: managerId
      }
    }
  });
  return computeAnalytics(claims, "Team");
}

export async function getEmployeeAnalytics(companyId: string, employeeId: string) {
  const claims = await fetchClaimsForAnalytics({
    companyId,
    employeeId
  });
  return computeAnalytics(claims, "Your");
}
