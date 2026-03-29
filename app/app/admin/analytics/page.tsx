import { requireRole } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/services/analytics-service";

import { SpendBreakdownChart, SpendTrendChart } from "@/components/analytics/expense-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function AnalyticsCommandCenterPage() {
  const user = await requireRole(["ADMIN"]);
  const analytics = await getAdminAnalytics(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Analytics"
        title="Enterprise spend intelligence"
        description="Category mix, department concentration, throughput, and trend visibility for finance leadership."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SpendTrendChart data={analytics.monthlySpend} title="Monthly total expense run-rate" />
        <SpendBreakdownChart data={analytics.departmentSpend} title="Department spend mix" />
      </div>
    </div>
  );
}
