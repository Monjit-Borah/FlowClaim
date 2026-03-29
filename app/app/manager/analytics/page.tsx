import { requireRole } from "@/lib/auth";
import { getManagerAnalytics } from "@/lib/services/analytics-service";

import { SpendBreakdownChart, SpendTrendChart } from "@/components/analytics/expense-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function ManagerAnalyticsPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const analytics = await getManagerAnalytics(user.companyId, user.id);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Manager analytics"
        title="Team response and spend trends"
        description="Track pending load, spend concentration, and approval efficiency."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SpendTrendChart data={analytics.monthlySpend} title="Team spend trend" />
        <SpendBreakdownChart data={analytics.categorySpend} title="Top team categories" />
      </div>
    </div>
  );
}
