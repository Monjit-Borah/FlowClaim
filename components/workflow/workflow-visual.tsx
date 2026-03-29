import { ArrowDown, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WorkflowTemplate } from "@/lib/types";

export function WorkflowVisual({ workflow }: { workflow: WorkflowTemplate }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Workflow template</p>
          <h3 className="mt-1 text-2xl font-semibold">{workflow.name}</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">{workflow.description}</p>
        </div>
        <Badge tone="warning">{workflow.mode}</Badge>
      </div>
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="rounded-[26px] border border-border/70 bg-white/80 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{step.approverType}</p>
              <p className="mt-1 font-medium">{step.name}</p>
              <p className="mt-2 text-sm text-muted">{step.conditionChip}</p>
            </div>
            {index < workflow.steps.length - 1 ? (
              <>
                <ArrowRight className="hidden h-4 w-4 text-muted lg:block" />
                <ArrowDown className="h-4 w-4 text-muted lg:hidden" />
              </>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
