import { Camera, ScanSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExpenseClaim } from "@/lib/types";

export function ReceiptPreview({ claim }: { claim: ExpenseClaim }) {
  const ocr = claim.receipt?.ocr;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Receipt intelligence</p>
          <h3 className="mt-1 text-xl font-semibold">{claim.receipt?.fileName ?? "No receipt"}</h3>
        </div>
        <Badge tone="warning">OCR {Math.round((ocr?.confidence ?? 0) * 100)}%</Badge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-alt flex min-h-[280px] items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-highlightSoft">
              <Camera className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm text-muted">Camera-scan presentation block</p>
            <p className="mt-2 text-lg font-medium">{claim.vendor}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ScanSearch className="h-4 w-4" />
              Extracted fields
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Merchant", ocr?.merchant],
                ["Date", ocr?.date],
                ["Amount", `${ocr?.currency} ${ocr?.amount}`],
                ["Tax", `${ocr?.currency} ${ocr?.tax}`],
                ["Category", ocr?.suggestedCategory]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-highlightSoft/50 p-4">
            <p className="text-sm font-medium">Low-confidence fallback</p>
            <p className="mt-2 text-sm text-muted">
              {ocr?.lowConfidenceFields.length
                ? `Review suggested for: ${ocr.lowConfidenceFields.join(", ")}.`
                : "No manual corrections needed. AI extraction is ready for submission."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
