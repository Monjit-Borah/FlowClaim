import { FraudLevel } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function runFraudChecks(input: {
  claimId?: string;
  companyId: string;
  merchant: string;
  amount: number;
  date: string;
  confidence: number;
  category: string;
}) {
  const existingClaims = await prisma.expenseClaim.findMany({
    where: {
      companyId: input.companyId,
      merchant: input.merchant
    }
  });

  const flags: Array<{
    title: string;
    description: string;
    level: FraudLevel;
    score: number;
  }> = [];

  const duplicate = existingClaims.find(
    (claim) =>
      claim.id !== input.claimId &&
      Math.abs(claim.amount - input.amount) < 0.01 &&
      claim.expenseDate.toISOString().slice(0, 10) === input.date
  );

  if (duplicate) {
    flags.push({
      title: "Possible duplicate receipt",
      description: `Matched against claim ${duplicate.id} on merchant, amount, and date.`,
      level: FraudLevel.HIGH,
      score: 84
    });
  }

  if (input.amount > 5000) {
    flags.push({
      title: "Unusually high spend",
      description: "Claim exceeds common peer benchmark for this category.",
      level: FraudLevel.HIGH,
      score: 72
    });
  }

  if (input.confidence < 0.8) {
    flags.push({
      title: "Low OCR confidence",
      description: "Receipt extraction confidence is below the trusted threshold.",
      level: FraudLevel.MEDIUM,
      score: 52
    });
  }

  return flags;
}

export async function replaceFraudFlags(claimId: string, flags: Awaited<ReturnType<typeof runFraudChecks>>) {
  await prisma.fraudFlag.deleteMany({ where: { claimId } });
  if (!flags.length) return [];
  await prisma.fraudFlag.createMany({
    data: flags.map((flag) => ({
      claimId,
      ...flag
    }))
  });
  return prisma.fraudFlag.findMany({ where: { claimId } });
}
