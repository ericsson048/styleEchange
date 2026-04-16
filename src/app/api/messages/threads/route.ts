import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  sellerId: z.string(),
  productId: z.string().optional(),
  initialMessage: z.string().min(1).max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const meId = session.user.id;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { sellerId, productId, initialMessage } = parsed.data;

  if (meId === sellerId)
    return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un message." }, { status: 400 });

  // Chercher un thread existant entre ces deux utilisateurs pour ce produit
  const existing = await prisma.messageThread.findFirst({
    where: {
      buyerId: meId,
      sellerId,
      productId: productId ?? null,
    },
  });

  if (existing) {
    return NextResponse.json({ threadId: existing.id, isNew: false });
  }

  // Créer un nouveau thread
  const thread = await prisma.messageThread.create({
    data: {
      buyerId: meId,
      sellerId,
      productId: productId ?? null,
    },
  });

  // Envoyer le message initial si fourni
  if (initialMessage) {
    await prisma.message.create({
      data: { threadId: thread.id, senderId: meId, text: initialMessage },
    });
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    });
  }

  return NextResponse.json({ threadId: thread.id, isNew: true }, { status: 201 });
}
