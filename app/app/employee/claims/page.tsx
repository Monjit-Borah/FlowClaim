import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";

import { ClaimsTable } from "@/components/claims/claims-table";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function MyClaimsPage() {
  const user = await requireRole(["EMPLOYEE", "MANAGER", "ADMIN"]);
  const myClaims = await listClaims({ employeeId: user.id });
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="My claims"
        title="Claim history"
        description="Track every submission across draft, review, approved, and paid states."
      />
      <ClaimsTable claims={myClaims} />
    </div>
  );
}
