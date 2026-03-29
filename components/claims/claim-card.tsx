import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExpenseClaim } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const statusTone: Record<string, "default" | "success" | "warning" | "danger"> = {
  Paid: "success",
  Approved: "success",
  "In Payment Queue": "warning",
  "Pending Manager Approval": "warning",
  "Pending Finance Approval": "warning",
  Rejected: "danger",
  "Ready for Review": "default"
};

export function ClaimCard({ claim, href }: { claim: ExpenseClaim; href: string }) {
  return (
    <Link href={href}>
      <Card className="p-5 transition duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{claim.category}</p>
            <h3 className="mt-1 text-lg font-semibold">{claim.vendor}</h3>
          </div>
          <Badge tone={statusTone[claim.status] ?? "default"}>{claim.status}</Badge>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted">{claim.employeeName}</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(claim.convertedAmount, claim.companyCurrency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Risk</p>
            <p className="mt-1 text-lg font-medium">{claim.riskScore}/100</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
