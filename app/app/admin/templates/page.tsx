import { requireRole } from "@/lib/auth";
import { listWorkflowTemplates } from "@/lib/services/workflow-engine";

import { SectionHeading } from "@/components/shared/section-heading";
import { WorkflowVisual } from "@/components/workflow/workflow-visual";

export default async function ApprovalTemplatesPage() {
  const user = await requireRole(["ADMIN"]);
  const workflowTemplates = await listWorkflowTemplates(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Templates"
        title="Preloaded approval playbooks"
        description="Demo workflows for thresholds, international routing, parallel consensus, and CFO override."
      />
      <div className="space-y-4">
        {workflowTemplates.map((template) => (
          <WorkflowVisual key={template.id} workflow={template} />
        ))}
      </div>
    </div>
  );
}
