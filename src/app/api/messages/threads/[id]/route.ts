import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserOnline } from "@/lib/presence";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const { id } = await params;
  const meId = session.user.id;

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
        seller: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    }

    if (thread.buyerId !== meId && thread.sellerId !== meId) {
      return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
    }

    try {
      await prisma.message.updateMany({
        where: { threadId: id, senderId: { not: meId }, isRead: false },
        data: { isRead: true },
      });
    } catch (error) {
      console.error("[THREAD GET] Prisma read-state error:", error);
    }

    const other = thread.buyerId === meId ? thread.seller : thread.buyer;

    return NextResponse.json({
      messages: thread.messages.map((message) => ({
        id: message.id,
        text: message.text,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderAvatar: message.sender.avatarUrl,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      })),
      otherOnline: isUserOnline(other.lastSeenAt),
    });
  } catch (error) {
    console.error("[THREAD GET] Prisma error:", error);
    return NextResponse.json({
      messages: [],
      otherOnline: false,
      degraded: true,
    });
  }
}
