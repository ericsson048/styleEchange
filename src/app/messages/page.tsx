import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesPageClient } from "@/components/messages/MessagesPageClient";
import { isUserOnline } from "@/lib/presence";

function formatTime(value: Date): string {
  return value.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/messages");

  const meId = session.user.id;

  const threads = await prisma.messageThread.findMany({
    where: { OR: [{ buyerId: meId }, { sellerId: meId }] },
    include: {
      buyer: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
      seller: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] bg-muted/20 rounded-2xl animate-pulse" />}>
      <MessagesPageClient
        meId={meId}
        threads={threads.map((thread) => {
        const other = thread.buyerId === meId ? thread.seller : thread.buyer;
        const last = thread.messages[thread.messages.length - 1];
        const unread = thread.messages.filter(
          (m) => m.senderId !== meId && !m.isRead
        ).length;

        return {
          id: thread.id,
          summary: {
            id: thread.id,
            name: other.name,
            avatar: other.avatarUrl ?? `https://picsum.photos/seed/${other.id}/100/100`,
            online: isUserOnline(other.lastSeenAt),   // ← dynamique
            time: last ? formatTime(last.createdAt) : "",
            lastMsg: last?.text ?? "",
            unread,
          },
          messages: thread.messages.map((m) => ({
            id: m.id,
            text: m.text,
            sender: m.senderId === meId ? ("me" as const) : ("them" as const),
            senderName: m.senderId === meId ? "Moi" : other.name,
            senderAvatar: m.senderId === meId ? null : other.avatarUrl,
            time: formatTime(m.createdAt),
            createdAt: m.createdAt.toISOString(),
          })),
        };
      })}
    />
    </Suspense>
  );
}
