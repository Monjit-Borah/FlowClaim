import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";

import { ClaimsTable } from "@/components/claims/claims-table";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function AdminClaimsPage() {
  const user = await requireRole(["ADMIN"]);
  const claims = await listClaims({ companyId: user.companyId });
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="All expenses"
        title="Company-wide claims ledger"
        description="Beautiful card-table hybrid for every reimbursement record across departments and statuses."
      />
      <ClaimsTable claims={claims} />
    </div>
  );
}
