import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserOnline } from "@/lib/presence";

// GET — récupère les messages d'un thread (polling)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const meId = session.user.id;

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

  if (!thread) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (thread.buyerId !== meId && thread.sellerId !== meId)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  // Marquer les messages non lus comme lus
  await prisma.message.updateMany({
    where: { threadId: id, senderId: { not: meId }, isRead: false },
    data: { isRead: true },
  });

  const other = thread.buyerId === meId ? thread.seller : thread.buyer;

  return NextResponse.json({
    messages: thread.messages.map((m) => ({
      id: m.id,
      text: m.text,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderAvatar: m.sender.avatarUrl,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })),
    otherOnline: isUserOnline(other.lastSeenAt),
  });
}
