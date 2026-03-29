import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function FraudList({
  riskyClaims
}: {
  riskyClaims: Array<{ id: string; employeeName: string; vendor: string; fraudFlags: { description: string }[]; riskScore: number }>;
}) {
  return (
    <div className="space-y-3">
      {riskyClaims.map((claim) => (
        <Card key={claim.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{claim.employeeName}</p>
              <h3 className="mt-1 text-lg font-semibold">{claim.vendor}</h3>
              <p className="mt-2 text-sm text-muted">{claim.fraudFlags[0]?.description}</p>
            </div>
            <Badge tone="danger">Risk {claim.riskScore}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
