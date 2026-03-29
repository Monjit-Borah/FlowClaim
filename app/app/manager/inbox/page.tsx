import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";
import { getPendingApprovalInbox } from "@/lib/services/approval-service";

import { ClaimsTable } from "@/components/claims/claims-table";
import { ManagerApprovalTable } from "@/components/claims/manager-approval-table";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function PendingApprovalsPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const pending = (await listClaims({ managerId: user.id })).filter((claim) => claim.status.includes("Pending"));
  const pendingApprovals = await getPendingApprovalInbox(user.id);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Approval inbox"
        title="Pending approvals"
        description="Claim details, comments, OCR context, and next-step visibility for fast manager action."
      />
      <ClaimsTable claims={pending} />
      <ManagerApprovalTable approvals={pendingApprovals} />
    </div>
  );
}
