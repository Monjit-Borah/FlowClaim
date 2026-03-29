import { requireRole } from "@/lib/auth";
import { getEmployeeAnalytics } from "@/lib/services/analytics-service";
import { listClaims } from "@/lib/services/claim-service";

import { SpendBreakdownChart } from "@/components/analytics/expense-chart";
import { ClaimCard } from "@/components/claims/claim-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function EmployeeDashboardPage() {
  const user = await requireRole(["EMPLOYEE", "MANAGER", "ADMIN"]);
  const analytics = await getEmployeeAnalytics(user.companyId, user.id);
  const myClaims = (await listClaims({ employeeId: user.id })).slice(0, 3);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Employee experience"
        title="Your reimbursement home"
        description="Track submissions, reimbursement progress, recent activity, and AI-assisted claim drafting."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} href={`/app/employee/claims/${claim.id}`} />
          ))}
        </div>
        <SpendBreakdownChart data={analytics.categorySpend} title="Your category summary" />
      </div>
    </div>
  );
}
