import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ExpenseClaim } from "@/lib/types";

export function StatusTimeline({ claim }: { claim: ExpenseClaim }) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold">Lifecycle timeline</h3>
      <div className="mt-6 space-y-5">
        {claim.timeline.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlightSoft">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              {index < claim.timeline.length - 1 ? <div className="mt-2 h-full w-px bg-border" /> : null}
            </div>
            <div className="pb-6">
              <p className="text-sm text-muted">{item.timestamp}</p>
              <p className="mt-1 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
