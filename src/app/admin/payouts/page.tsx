import { prisma } from "@/lib/prisma";
import { AdminPayoutsClient } from "@/components/admin/AdminPayoutsClient";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.sellerPayout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true, email: true } },
      product: { select: { title: true } },
    },
  });

  const totalPending = payouts.filter((p) => p.status === "PENDING").reduce((s, p) => s + Number(p.netAmount), 0);
  const totalPaid = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + Number(p.netAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reversements vendeurs</h1>
        <p className="text-muted-foreground mt-1">
          {payouts.length} reversement{payouts.length > 1 ? "s" : ""} —{" "}
          <span className="text-orange-500 font-medium">{totalPending.toLocaleString("fr-BI")} BIF en attente</span> —{" "}
          <span className="text-green-600 font-medium">{totalPaid.toLocaleString("fr-BI")} BIF versés</span>
        </p>
      </div>
      <AdminPayoutsClient payouts={payouts.map((p) => ({
        id: p.id, sellerName: p.seller.name, sellerEmail: p.seller.email,
        productTitle: p.product.title, orderId: p.orderId,
        grossAmount: Number(p.grossAmount), platformFee: Number(p.platformFee),
        shippingFee: Number(p.shippingFee), netAmount: Number(p.netAmount),
        status: p.status, paidAt: p.paidAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      }))} />
    </div>
  );
}
