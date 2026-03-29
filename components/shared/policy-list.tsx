import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function PolicyList({
  policyRules
}: {
  policyRules: Array<{ id: string; name: string; description: string; severity: "SOFT" | "HARD" }>;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {policyRules.map((rule) => (
          <div key={rule.id} className="rounded-[24px] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="mt-1 text-sm text-muted">{rule.description}</p>
              </div>
              <Badge tone={rule.severity === "HARD" ? "danger" : "warning"}>{rule.severity}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
