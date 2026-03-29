import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HeroPanel() {
  return (
    <Card className="overflow-hidden p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Badge tone="warning">Intelligent reimbursement operating system</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
              ClaimFlow AI turns reimbursement chaos into governed, real-time operations.
            </h1>
            <p className="max-w-2xl text-base text-muted lg:text-lg">
              OCR extraction, adaptive routing, fraud checks, policy enforcement, and finance-ready
              payouts in one premium workflow layer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Launch demo workspace</Button>
            <Button variant="secondary" size="lg">
              Explore product tour
            </Button>
          </div>
        </div>
        <div className="surface-alt soft-grid p-6">
          <div className="rounded-[26px] border border-white/70 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Live approval velocity</p>
                <p className="mt-2 text-3xl font-semibold">18 hours</p>
              </div>
              <Badge tone="success">Down 6h</Badge>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["OCR confidence", "94%"],
                ["Policy compliance", "96%"],
                ["Fraud catch rate", "4.8x"],
                ["Straight-through payouts", "71%"]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-panel px-4 py-3"
                >
                  <span className="text-sm text-muted">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
