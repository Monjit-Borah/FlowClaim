import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  delta
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-full bg-highlightSoft p-2 text-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-5 text-sm text-muted">{delta} vs last month</p>
    </Card>
  );
}
