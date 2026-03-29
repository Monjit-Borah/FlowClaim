import { requireRole } from "@/lib/auth";
import { listPolicyRules } from "@/lib/services/policy-engine";
import { PolicyList } from "@/components/shared/policy-list";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function PolicyRulesPage() {
  const user = await requireRole(["ADMIN"]);
  const rules = await listPolicyRules(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Policy engine"
        title="Policy rules and exception logic"
        description="Set soft and hard rules for meals, lodging, age of claim, travel thresholds, and mandatory fields."
      />
      <PolicyList policyRules={rules.map((rule) => ({ ...rule, severity: rule.severity as "SOFT" | "HARD" }))} />
    </div>
  );
}
