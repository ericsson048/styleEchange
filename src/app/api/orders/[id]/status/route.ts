import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Statuts que le vendeur peut définir
const SELLER_ALLOWED = ["SHIPPED", "DELIVERED"];

const STATUS_LABELS: Record<string, string> = {
  SHIPPED: "expédié",
  DELIVERED: "livré",
  CANCELLED: "annulé",
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: { select: { title: true } } },
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const isSeller = order.sellerId === session.user.id;

  if (!isAdmin && !isSeller)
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  if (!isAdmin && !SELLER_ALLOWED.includes(status))
    return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });

  await prisma.order.update({ where: { id }, data: { status } });

  // Notifier l'acheteur
  await createNotification({
    userId: order.buyerId,
    type: "ORDER_STATUS",
    title: `Commande ${STATUS_LABELS[status] ?? status}`,
    body: `Votre commande "${order.product.title}" a été ${STATUS_LABELS[status] ?? status}.`,
    link: `/profile?tab=orders`,
  });

  return NextResponse.json({ success: true });
}
