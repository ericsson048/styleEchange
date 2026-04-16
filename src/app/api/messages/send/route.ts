import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  threadId: z.string(),
  text: z.string().max(2000).optional().default(""),
  mediaUrl: z.string().optional(),   // base64 data URL
  mediaType: z.enum(["image", "audio"]).optional(),
}).refine(
  (d) => (d.text && d.text.trim().length > 0) || d.mediaUrl,
  { message: "Texte ou média requis." }
);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { threadId, text, mediaUrl, mediaType } = parsed.data;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  if (!thread) return NextResponse.json({ error: "Thread introuvable." }, { status: 404 });

  const meId = session.user.id;
  const isBuyer = thread.buyerId === meId;
  const isSeller = thread.sellerId === meId;
  if (!isBuyer && !isSeller)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId,
        senderId: meId,
        text: text ?? "",
        ...(mediaUrl ? { mediaUrl } : {}),
        ...(mediaType ? { mediaType } : {}),
      } as any,
    }),
    prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  // Notification
  const recipientId = isBuyer ? thread.sellerId : thread.buyerId;
  const senderName = isBuyer ? thread.buyer.name : thread.seller.name;
  const notifBody = mediaType === "image"
    ? "📷 Image"
    : mediaType === "audio"
    ? "🎤 Message vocal"
    : (text ?? "").length > 80 ? (text ?? "").slice(0, 80) + "…" : (text ?? "");

  await createNotification({
    userId: recipientId,
    type: "NEW_MESSAGE",
    title: `Nouveau message de ${senderName}`,
    body: notifBody,
    link: `/messages?thread=${threadId}`,
  });

  const msg = message as any;
  return NextResponse.json({
    id: msg.id,
    text: msg.text,
    mediaUrl: msg.mediaUrl ?? null,
    mediaType: msg.mediaType ?? null,
    senderId: msg.senderId,
    createdAt: msg.createdAt.toISOString(),
    isRead: false,
  });
}
