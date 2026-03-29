import { requireRole } from "@/lib/auth";
import { listApprovalRulesWorkspace } from "@/lib/services/approval-rules-service";

import { SectionHeading } from "@/components/shared/section-heading";
import { ApprovalRulesManager } from "@/components/workflow/approval-rules-manager";

export default async function AdminWorkflowsPage() {
  const user = await requireRole(["ADMIN"]);
  const workspace = await listApprovalRulesWorkspace(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Approval rules"
        title="Admin approval rules management"
        description="Assign managers, define approvers, set sequential or percentage-based logic, and save enterprise-grade reimbursement routing from one screen."
      />
      <ApprovalRulesManager
        initialRows={workspace.rows}
        managers={workspace.managerOptions}
        approvers={workspace.approverOptions}
      />
    </div>
  );
}
