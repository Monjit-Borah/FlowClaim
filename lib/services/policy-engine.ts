import { prisma } from "@/lib/db";

export async function listPolicyRules(companyId: string) {
  return prisma.policyRule.findMany({ where: { companyId } });
}

export async function validatePolicy(input: {
  companyId: string;
  category: string;
  convertedAmount: number;
  hasReceipt: boolean;
  ageInDays: number;
  isWeekend?: boolean;
}) {
  const rules = await prisma.policyRule.findMany({ where: { companyId: input.companyId } });
  return rules.flatMap((rule) => {
    const violations: Array<{
      id: string;
      title: string;
      description: string;
      severity: "SOFT" | "HARD";
      resolvedByJustification?: boolean;
    }> = [];

    if (rule.category && rule.category !== input.category) {
      return violations;
    }

    if (rule.threshold != null && input.convertedAmount > rule.threshold) {
      violations.push({
        id: `${rule.id}-threshold`,
        title: rule.name,
        description: rule.description,
        severity: rule.severity,
        resolvedByJustification: rule.severity === "SOFT"
      });
    }

    if (rule.requiresReceipt && !input.hasReceipt) {
      violations.push({
        id: `${rule.id}-receipt`,
        title: rule.name,
        description: rule.description,
        severity: rule.severity
      });
    }

    if (/late/i.test(rule.name) && input.ageInDays > 30) {
      violations.push({
        id: `${rule.id}-late`,
        title: rule.name,
        description: rule.description,
        severity: rule.severity,
        resolvedByJustification: true
      });
    }

    if (/weekend/i.test(rule.name) && input.isWeekend) {
      violations.push({
        id: `${rule.id}-weekend`,
        title: rule.name,
        description: rule.description,
        severity: rule.severity
      });
    }

    return violations;
  });
}
