import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSchema = z.object({ productId: z.string() });

// POST — ajouter un article au panier
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { productId } = parsed.data;
  const meId = session.user.id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  if (!product.isActive) return NextResponse.json({ error: "Ce produit n'est plus disponible." }, { status: 400 });
  if (product.ownerId === meId) return NextResponse.json({ error: "Vous ne pouvez pas acheter votre propre article." }, { status: 400 });

  // Vérifier si déjà commandé
  const alreadyOrdered = await prisma.order.findFirst({
    where: { productId, status: { in: ["PENDING", "PAID", "SHIPPED", "DELIVERED"] } },
  });
  if (alreadyOrdered) return NextResponse.json({ error: "Cet article est déjà réservé." }, { status: 400 });

  // Créer ou récupérer le panier
  const cart = await prisma.cart.upsert({
    where: { userId: meId },
    create: { userId: meId },
    update: {},
  });

  // Ajouter l'article (upsert pour éviter les doublons)
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, unitPrice: product.price },
    update: {},
  });

  return NextResponse.json({ success: true });
}
