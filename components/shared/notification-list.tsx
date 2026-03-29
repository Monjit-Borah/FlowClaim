import { BellDot } from "lucide-react";

import { Card } from "@/components/ui/card";

export function NotificationList({
  notifications
}: {
  notifications: Array<{ id: string; title: string; description: string; time: string }>;
}) {
  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <Card key={item.id} className="p-5">
          <div className="flex gap-4">
            <div className="rounded-full bg-highlightSoft p-3">
              <BellDot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.time}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
