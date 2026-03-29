import { requireRole } from "@/lib/auth";
import { MarkPaidButton } from "@/components/dashboard/mark-paid-button";
import { getPaymentQueue } from "@/lib/services/finance-service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrency } from "@/lib/utils";

export default async function PayoutManagementPage() {
  const user = await requireRole(["ADMIN"]);
  const payments = await getPaymentQueue(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance layer"
        title="Reimbursement payout queue"
        description="Approved claims land here for finance completion, payout references, and lifecycle closure."
      />
      <Card className="p-6">
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border/70 bg-white/70 p-5">
              <div>
                <p className="font-medium">{payment.claim.employee.name}</p>
                <p className="mt-1 text-sm text-muted">{payment.claimId}</p>
              </div>
              <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
              <div className="text-sm text-muted">{payment.paidAt ? "Completed" : "Queued"}</div>
              <Badge tone={payment.status === "PAID" ? "success" : "warning"}>{payment.status}</Badge>
              {payment.status !== "PAID" ? <MarkPaidButton paymentId={payment.id} /> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
