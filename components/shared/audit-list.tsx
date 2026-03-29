import { Card } from "@/components/ui/card";

export function AuditList({
  auditLogs
}: {
  auditLogs: Array<{ id: string; action: string; target: string; timestamp: string; actor: string; detail: string }>;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {auditLogs.map((entry) => (
          <div key={entry.id} className="rounded-[24px] border border-border/70 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {entry.action} · {entry.target}
              </p>
              <p className="text-sm text-muted">{entry.timestamp}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{entry.actor}</p>
            <p className="mt-3 text-sm">{entry.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
