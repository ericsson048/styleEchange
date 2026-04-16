import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { title: true, imageUrl: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Commandes</h1>
        <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
      </div>
      <AdminOrdersTable
        orders={orders.map((o) => ({
          id: o.id,
          buyerName: o.buyer.name,
          buyerEmail: o.buyer.email,
          productTitle: o.product.title,
          productImage: o.product.imageUrl,
          amount: Number(o.amount),
          protectionFee: Number(o.protectionFee),
          shippingFee: Number(o.shippingFee),
          status: o.status,
          shippingMethod: o.shippingMethod,
          stripePaymentId: o.stripePaymentId,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
