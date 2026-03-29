import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkflowTemplate } from "@/lib/types";

export function WorkflowBuilder({ templates }: { templates: WorkflowTemplate[] }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Visual workflow builder</p>
          <h3 className="mt-1 text-2xl font-semibold">Adaptive approval routing</h3>
        </div>
        <Button variant="highlight">
          <Plus className="h-4 w-4" />
          Add workflow step
        </Button>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-[26px] border border-border/70 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium">{template.name}</p>
              <span className="rounded-full bg-panelAlt px-3 py-1 text-xs text-muted">{template.mode}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{template.trigger}</p>
            <div className="mt-4 space-y-2">
              {template.steps.map((step) => (
                <div key={step.id} className="rounded-2xl bg-panel px-4 py-3">
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs text-muted">{step.conditionChip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
