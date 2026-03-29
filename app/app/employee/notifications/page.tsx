import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/services/notification-service";
import { NotificationList } from "@/components/shared/notification-list";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listNotifications(user.id);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Notifications"
        title="In-app notification center"
        description="Claim submitted, approval requested, approved, rejected, escalated, and paid updates."
      />
      <NotificationList notifications={notifications} />
    </div>
  );
}
