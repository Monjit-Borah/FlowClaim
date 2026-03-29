import { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { mapNotification } from "@/lib/view-models";

export async function listNotifications(userId?: string) {
  const notifications = await prisma.notification.findMany({
    where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
    orderBy: { createdAt: "desc" }
  });
  return notifications.map(mapNotification);
}

export async function createNotification(input: {
  companyId: string;
  userId?: string | null;
  type: NotificationType;
  title: string;
  description: string;
}) {
  return prisma.notification.create({
    data: {
      companyId: input.companyId,
      userId: input.userId ?? null,
      type: input.type,
      title: input.title,
      description: input.description
    }
  });
}
