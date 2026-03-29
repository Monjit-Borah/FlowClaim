import { requireRole } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/services/analytics-service";
import { listClaims } from "@/lib/services/claim-service";
import { listNotifications } from "@/lib/services/notification-service";

import { SpendBreakdownChart, SpendTrendChart } from "@/components/analytics/expense-chart";
import { ClaimCard } from "@/components/claims/claim-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FraudList } from "@/components/shared/fraud-list";
import { NotificationList } from "@/components/shared/notification-list";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);
  const analytics = await getAdminAnalytics(user.companyId);
  const featuredClaims = (await listClaims({ companyId: user.companyId })).slice(0, 3);
  const notifications = await listNotifications(user.id);
  const riskyClaims = featuredClaims.filter((claim) => claim.fraudFlags.length);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin experience"
        title="Company-wide reimbursement command"
        description="Monitor spend, approval health, fraud alerts, payouts, and workforce coverage from one premium operating layer."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SpendTrendChart data={analytics.monthlySpend} title="Monthly spend velocity" />
        <SpendBreakdownChart data={analytics.categorySpend} title="Category concentration" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SectionHeading title="Claims requiring attention" description="High-impact claims surfaced with risk, policy, and payout context." />
          <div className="grid gap-4 xl:grid-cols-3">
            {featuredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} href={`/app/manager/claims/${claim.id}`} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SectionHeading title="Fraud center preview" description="Claims with the strongest anomaly patterns." />
          <FraudList riskyClaims={riskyClaims} />
        </div>
      </div>
      <div className="space-y-4">
        <SectionHeading title="Live notifications" description="Operational signals across approval, payout, and risk." />
        <NotificationList notifications={notifications} />
      </div>
    </div>
  );
}
