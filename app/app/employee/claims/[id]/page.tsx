import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { getClaim } from "@/lib/services/claim-service";

import { ReceiptPreview } from "@/components/claims/receipt-preview";
import { StatusTimeline } from "@/components/claims/status-timeline";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function EmployeeClaimDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["EMPLOYEE", "MANAGER", "ADMIN"]);
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Claim detail"
        title={`${claim.vendor} reimbursement timeline`}
        description={claim.aiSummary}
      />
      <ReceiptPreview claim={claim} />
      <StatusTimeline claim={claim} />
    </div>
  );
}
