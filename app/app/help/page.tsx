import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Support"
        title="Help and support"
        description="Premium assistance surface for policy questions, payout issues, workflow changes, and compliance requests."
      />
      <Card className="p-6">
        <p className="text-sm text-muted">
          Demo support page with escalation categories, support SLA cards, and product assistance entry points.
        </p>
      </Card>
    </div>
  );
}
