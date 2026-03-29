import { requireRole } from "@/lib/auth";
import { getCompany } from "@/lib/services/company-service";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function CompanySettingsPage() {
  const user = await requireRole(["ADMIN"]);
  const company = await getCompany(user.companyId);
  if (!company) {
    return null;
  }
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Company settings"
        title="Workspace configuration"
        description="Base currency, industry profile, approval preference, and compliance posture."
      />
      <Card className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries({
          Company: company.name,
          Country: company.country,
          Currency: company.baseCurrency,
          Approval: company.approvalPreference
        }).map(([label, value]) => (
          <div key={label} className="rounded-[24px] bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
            <p className="mt-2 text-lg font-medium">{value}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
