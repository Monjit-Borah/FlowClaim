import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";
import { FraudList } from "@/components/shared/fraud-list";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function FraudCenterPage() {
  const user = await requireRole(["ADMIN"]);
  const riskyClaims = (await listClaims({ companyId: user.companyId })).filter((claim) => claim.fraudFlags.length);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Fraud intelligence"
        title="Anomaly and duplicate monitoring center"
        description="Risk-scored claims surfaced with explainable anomaly signals and duplicate patterns."
      />
      <FraudList riskyClaims={riskyClaims} />
    </div>
  );
}
