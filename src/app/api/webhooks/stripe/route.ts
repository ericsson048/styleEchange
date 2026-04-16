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
          // Renseigner le sellerId si pas encore fait
          sellerId: order?.product.ownerId ?? undefined,
        },
      });

      // Notifier le vendeur
      if (order?.product.ownerId) {
        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
          userId: order.product.ownerId,
          type: "NEW_ORDER",
          title: "Nouvelle vente !",
          body: `Votre article "${order.product.title}" a été acheté.`,
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
