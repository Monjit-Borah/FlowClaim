import { requireRole } from "@/lib/auth";
import { listWorkflowTemplates } from "@/lib/services/workflow-engine";

import { SectionHeading } from "@/components/shared/section-heading";
import { WorkflowBuilder } from "@/components/workflow/workflow-builder";

export default async function AdminWorkflowsPage() {
  const user = await requireRole(["ADMIN"]);
  const workflowTemplates = await listWorkflowTemplates(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Workflow engine"
        title="Conditional approval orchestration"
        description="Configure sequence-based, parallel, percentage, override, and hybrid logic with premium visual controls."
      />
      <WorkflowBuilder templates={workflowTemplates} />
    </div>
  );
}
