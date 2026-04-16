import "server-only";
import { prisma } from "@/lib/prisma";

type NotificationType = "NEW_MESSAGE" | "NEW_ORDER" | "ORDER_STATUS" | "NEW_REVIEW";

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, body, link: link ?? null },
  });
}
