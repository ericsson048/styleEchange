import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { productId, shippingMethod } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { owner: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    const price = Number(product.price);
    const protectionFee = Math.round(price * 0.05 * 100) / 100;
    const shippingFee = shippingMethod === "home" ? 6.9 : 3.5;
    const total = Math.round((price + protectionFee + shippingFee) * 100);

    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id!,
        sellerId: product.ownerId,
        productId: product.id,
        amount: price,
        protectionFee,
        shippingFee,
        shippingMethod,
        status: "PENDING",
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.title,
              description: `Vendu par ${product.owner.name}`,
              // Stripe n'accepte que des URLs publiques (pas de base64)
              images: product.imageUrl && product.imageUrl.startsWith("http")
                ? [product.imageUrl]
                : [],
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        productId: product.id,
        buyerId: session.user.id!,
      },
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?productId=${productId}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[CHECKOUT]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
