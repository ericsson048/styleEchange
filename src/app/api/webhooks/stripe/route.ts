import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[WEBHOOK] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Récupérer la commande pour notifier le vendeur
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: { select: { title: true, ownerId: true } } },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
          threeDSecure: session.payment_method_options?.card?.request_three_d_secure !== "any" ? false : true,
          sellerId: order?.product.ownerId ?? undefined,
        },
      });

      // Créer le reversement vendeur automatiquement
      if (order && order.product.ownerId) {
        const gross = Number(order.amount);
        const platformFee = Math.round(gross * 0.05 * 100) / 100;
        const shipping = Number(order.shippingFee);
        const net = gross - platformFee;

        await prisma.sellerPayout.upsert({
          where: { orderId },
          create: {
            sellerId: order.product.ownerId,
            orderId,
            productId: order.productId,
            grossAmount: gross,
            platformFee,
            shippingFee: shipping,
            netAmount: net,
            status: "PENDING",
          },
          update: {},
        });

        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
          userId: order.product.ownerId,
          type: "NEW_ORDER",
          title: "Nouvelle vente !",
          body: `Votre article "${order.product.title}" a été acheté. Reversement en attente : ${net.toLocaleString("fr-BI")} BIF.`,
          link: `/profile?tab=sales`,
        });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
