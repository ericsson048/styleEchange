import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS GET] Prisma error:", error);
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      degraded: true,
    });
  }
}

export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS PATCH] Prisma error:", error);
    return NextResponse.json({ success: false, degraded: true });
  }

  return NextResponse.json({ success: true });
}
