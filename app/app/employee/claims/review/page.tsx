import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { getClaim } from "@/lib/services/claim-service";

import { ReceiptPreview } from "@/components/claims/receipt-preview";
import { SubmitClaimButton } from "@/components/claims/submit-claim-button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function OCRReviewPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireRole(["EMPLOYEE", "MANAGER", "ADMIN"]);
  const { id } = await searchParams;
  if (!id) notFound();
  const claim = await getClaim(id);
  if (!claim) notFound();
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="OCR review"
        title="Review extracted receipt fields"
        description="OCR confidence, auto-filled data, low-confidence fallback, and AI category suggestion before final submission."
      />
      <ReceiptPreview claim={claim} />
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Submission guidance</p>
            <p className="mt-1 text-lg font-medium">
              Review extracted values, then submit to trigger live policy validation, fraud scoring, and workflow assignment.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/app/employee/claims/${claim.id}`}>
              <Button variant="secondary">Open claim</Button>
            </Link>
            <SubmitClaimButton claimId={claim.id} />
          </div>
        </div>
      </Card>
    </div>
  );
}
