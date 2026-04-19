import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const payouts = await prisma.sellerPayout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true, email: true } },
      order: { select: { id: true, status: true } },
      product: { select: { title: true } },
    },
  });

  return NextResponse.json(payouts.map((p) => ({
    id: p.id,
    sellerName: p.seller.name,
    sellerEmail: p.seller.email,
    productTitle: p.product.title,
    orderId: p.orderId,
    grossAmount: Number(p.grossAmount),
    platformFee: Number(p.platformFee),
    shippingFee: Number(p.shippingFee),
    netAmount: Number(p.netAmount),
    status: p.status,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id, status } = await req.json();
  if (!["PENDING", "APPROVED", "PAID", "FAILED"].includes(status))
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });

  const payout = await prisma.sellerPayout.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined },
    include: { seller: { select: { id: true, name: true } }, product: { select: { title: true } } },
  });

  if (status === "PAID") {
    await createNotification({
      userId: payout.seller.id,
      type: "ORDER_STATUS",
      title: "Reversement effectué",
      body: `Votre reversement pour "${payout.product.title}" a été effectué.`,
      link: "/profile?tab=sales",
    });
  }

  return NextResponse.json({ success: true });
}
