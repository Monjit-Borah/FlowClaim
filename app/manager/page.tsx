import { MockManagerHub } from "./mock-manager-hub";

import { SectionHeading } from "@/components/shared/section-heading";

export default function LocalManagerHubPage() {
  return (
    <div className="space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <SectionHeading
        eyebrow="Manager experience"
        title="Pending approvals"
        description="Mock manager approval queue with local AI review signals and no backend dependency."
      />
      <MockManagerHub />
    </div>
  );
}
