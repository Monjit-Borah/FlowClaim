import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title="Profile and preferences"
        description="Workspace-level settings, notification preferences, and support controls."
      />
      <Card className="p-6">
        <p className="text-sm text-muted">Mock-ready settings surface for profile, password, and notification preferences.</p>
      </Card>
    </div>
  );
}
