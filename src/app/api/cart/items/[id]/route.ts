import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — retirer un article du panier
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;

  // Vérifier que l'item appartient bien au panier de l'utilisateur
  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== session.user.id)
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await prisma.cartItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
