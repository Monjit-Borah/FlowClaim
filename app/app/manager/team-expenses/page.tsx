import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";

import { ClaimsTable } from "@/components/claims/claims-table";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function TeamExpensesPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const teamClaims = await listClaims({ managerId: user.id });
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Team expenses"
        title="Review spend by direct reports"
        description="Team-wide expense visibility with converted values and workflow status."
      />
      <ClaimsTable claims={teamClaims} />
    </div>
  );
}
