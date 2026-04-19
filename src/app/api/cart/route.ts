import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: { include: { owner: { select: { name: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], total: 0, count: 0 });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      title: item.product.title,
      price: Number(item.unitPrice),
      imageUrl: item.product.imageUrl ?? item.product.imageUrls[0] ?? null,
      ownerName: item.product.owner.name,
      isActive: item.product.isActive,
      quantity: item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return NextResponse.json({ items, total, count: items.length });
  } catch (error) {
    console.error("[CART GET] Prisma error:", error);
    return NextResponse.json({ items: [], total: 0, count: 0, degraded: true });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: session.user.id } },
    });
  } catch (error) {
    console.error("[CART DELETE] Prisma error:", error);
    return NextResponse.json({ success: false, degraded: true });
  }

  return NextResponse.json({ success: true });
}
