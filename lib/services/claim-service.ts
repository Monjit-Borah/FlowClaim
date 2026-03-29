import { ClaimStatus, NotificationType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { convertCurrency, getExchangeRates } from "@/lib/exchange";
import { runFraudChecks, replaceFraudFlags } from "@/lib/services/fraud-engine";
import { createAuditLog } from "@/lib/services/audit-service";
import { createNotification } from "@/lib/services/notification-service";
import { validatePolicy } from "@/lib/services/policy-engine";
import { attachWorkflowToClaim } from "@/lib/services/workflow-engine";
import { mapClaimToView } from "@/lib/view-models";

export async function listClaims(filters?: { companyId?: string; employeeId?: string; managerId?: string }) {
  const claims = await prisma.expenseClaim.findMany({
    where: {
      ...(filters?.companyId ? { companyId: filters.companyId } : {}),
      ...(filters?.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters?.managerId
        ? {
            employee: {
              employeeProfile: {
                managerUserId: filters.managerId
              }
            }
          }
        : {})
    },
    include: {
      employee: { include: { employeeProfile: { include: { department: true } } } },
      receipts: { include: { ocrExtraction: true } },
      fraudFlags: true,
      approvalActions: { include: { actor: true } },
      approvalRequests: { include: { approver: true } },
      lineItems: true
    },
    orderBy: { createdAt: "desc" }
  });

  return claims.map(mapClaimToView);
}

export async function getClaim(id: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { id },
    include: {
      employee: { include: { employeeProfile: { include: { department: true } } } },
      receipts: { include: { ocrExtraction: true } },
      fraudFlags: true,
      approvalActions: { include: { actor: true } },
      approvalRequests: { include: { approver: true } },
      lineItems: true
    }
  });
  return claim ? mapClaimToView(claim) : null;
}

export async function createDraftClaim(input: {
  companyId: string;
  employeeId: string;
  category: string;
  amount: number;
  currency: string;
  merchant: string;
  expenseDate: string;
  description: string;
  notes?: string;
  justification?: string;
}) {
  const company = await prisma.company.findUniqueOrThrow({ where: { id: input.companyId } });
  const conversion = await convertCurrency(input.amount, input.currency, company.baseCurrency);
  const fxSnapshot = await getExchangeRates(input.currency);

  const claim = await prisma.expenseClaim.create({
    data: {
      companyId: input.companyId,
      employeeId: input.employeeId,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      convertedAmount: conversion.amount,
      companyCurrency: company.baseCurrency,
      exchangeRate: conversion.rate,
      merchant: input.merchant,
      expenseDate: new Date(input.expenseDate),
      description: input.description,
      notes: input.notes,
      justification: input.justification,
      isInternational: input.currency !== company.baseCurrency,
      status: ClaimStatus.DRAFT
    }
  });

  await prisma.exchangeRateSnapshot.create({
    data: {
      companyId: input.companyId,
      baseCurrency: input.currency,
      rates: fxSnapshot.rates
    }
  });

  await createAuditLog({
    companyId: input.companyId,
    actorId: input.employeeId,
    action: "Claim created",
    target: claim.id,
    detail: `${input.category} claim drafted for ${input.merchant}`
  });

  return claim;
}

export async function finalizeClaimSubmission(claimId: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { id: claimId },
    include: {
      company: true,
      receipts: { include: { ocrExtraction: true } }
    }
  });
  if (!claim) throw new Error("Claim not found");

  const day = new Date(claim.expenseDate).getDay();
  const policyViolations = await validatePolicy({
    companyId: claim.companyId,
    category: claim.category,
    convertedAmount: claim.convertedAmount,
    hasReceipt: claim.receipts.length > 0,
    ageInDays: Math.floor((Date.now() - new Date(claim.expenseDate).getTime()) / (1000 * 60 * 60 * 24)),
    isWeekend: day === 0 || day === 6
  });

  const ocr = claim.receipts[0]?.ocrExtraction;
  const fraudFlags = await runFraudChecks({
    claimId,
    companyId: claim.companyId,
    merchant: claim.merchant,
    amount: claim.amount,
    date: claim.expenseDate.toISOString().slice(0, 10),
    confidence: ocr?.confidence ?? 0.9,
    category: claim.category
  });

  await replaceFraudFlags(claimId, fraudFlags);

  const riskScore = Math.max(...fraudFlags.map((flag) => flag.score), policyViolations.length ? 55 : 20);

  await prisma.expenseClaim.update({
    where: { id: claimId },
    data: {
      status: ClaimStatus.SUBMITTED,
      riskScore,
      aiSummary:
        policyViolations.length || fraudFlags.length
          ? `Policy findings: ${policyViolations.length}. Fraud signals: ${fraudFlags.length}.`
          : "Claim looks low risk and policy compliant.",
      similarInsight: `${fraudFlags.length ? "Requires careful review." : "Comparable claims have historically been approved."}`
    }
  });

  await attachWorkflowToClaim(claimId);

  await createNotification({
    companyId: claim.companyId,
    userId: claim.employeeId,
    type: NotificationType.SUBMITTED,
    title: "Claim submitted",
    description: `${claim.merchant} is now moving through approvals.`
  });

  await createAuditLog({
    companyId: claim.companyId,
    actorId: claim.employeeId,
    action: "Claim submitted",
    target: claim.id,
    detail: `Risk score ${riskScore}`
  });

  return getClaim(claimId);
}
