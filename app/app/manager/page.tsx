import { requireRole } from "@/lib/auth";
import { getManagerAnalytics } from "@/lib/services/analytics-service";
import { listClaims } from "@/lib/services/claim-service";

import { SpendBreakdownChart } from "@/components/analytics/expense-chart";
import { ClaimCard } from "@/components/claims/claim-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function ManagerDashboardPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const analytics = await getManagerAnalytics(user.companyId, user.id);
  const pendingClaims = (await listClaims({ managerId: user.id })).filter((claim) => claim.status.includes("Pending")).slice(0, 3);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Manager experience"
        title="Team approval command center"
        description="Review pending claims with AI context, team spend patterns, and response-time monitoring."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pendingClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} href={`/app/manager/claims/${claim.id}`} />
          ))}
        </div>
        <SpendBreakdownChart data={analytics.categorySpend} title="Team category mix" />
      </div>
    </div>
  );
}
