import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { getClaim } from "@/lib/services/claim-service";
import { listWorkflowTemplates } from "@/lib/services/workflow-engine";

import { ReceiptPreview } from "@/components/claims/receipt-preview";
import { ApprovalActionPanel } from "@/components/claims/approval-action-panel";
import { StatusTimeline } from "@/components/claims/status-timeline";
import { SectionHeading } from "@/components/shared/section-heading";
import { WorkflowVisual } from "@/components/workflow/workflow-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ManagerClaimDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) notFound();

  const workflow = (await listWorkflowTemplates(user.companyId))[0];
  const currentApprovalRequestId =
    claim.approvalRequests.find((request) => request.approverId === user.id && request.state === "PENDING")?.id ??
    claim.approvalRequests[0]?.id;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Claim review"
        title={`${claim.vendor} · ${claim.employeeName}`}
        description={claim.aiSummary}
        action={<Badge tone={claim.riskScore > 70 ? "danger" : "warning"}>Risk {claim.riskScore}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <ReceiptPreview claim={claim} />
        <Card className="p-6">
          <h3 className="text-xl font-semibold">AI recommendation panel</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-[24px] bg-panelAlt p-4">
              <p className="text-sm text-muted">Recommendation</p>
              <p className="mt-2 text-lg font-medium">
                {claim.riskScore > 70 ? "Escalate or hold for finance review" : "Approve with comment"}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-sm text-muted">Similar past expense insight</p>
              <p className="mt-2 text-sm">{claim.similarInsight}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-sm text-muted">Policy summary</p>
              <p className="mt-2 text-sm">
                {claim.policyViolations.length
                  ? claim.policyViolations.map((violation) => violation.title).join(", ")
                  : "No active policy blockers."}
              </p>
            </div>
            <ApprovalActionPanel approvalRequestId={currentApprovalRequestId} />
          </div>
        </Card>
      </div>
      {workflow ? <WorkflowVisual workflow={workflow} /> : null}
      <StatusTimeline claim={claim} />
    </div>
  );
}
