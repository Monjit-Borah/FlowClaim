import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExpenseClaim } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ClaimsTable({ claims }: { claims: ExpenseClaim[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_110px] gap-3 border-b border-border/70 px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted">
        <span>Claim</span>
        <span>Employee</span>
        <span>Workflow</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-border/60">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_110px] gap-3 px-6 py-4 text-sm"
          >
            <div>
              <p className="font-medium">{claim.vendor}</p>
              <p className="text-muted">{claim.description}</p>
            </div>
            <div>
              <p>{claim.employeeName}</p>
              <p className="text-muted">{claim.department}</p>
            </div>
            <div>
              <p>{claim.approvalRequests[0]?.stepName ?? "Completed"}</p>
              <p className="text-muted">{claim.approvalRequests[0]?.approverName ?? claim.status}</p>
            </div>
            <div className="font-medium">
              {formatCurrency(claim.convertedAmount, claim.companyCurrency)}
            </div>
            <div>
              <Badge tone={claim.status.includes("Rejected") ? "danger" : "warning"}>{claim.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
