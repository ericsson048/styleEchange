import { prisma } from "@/lib/prisma";
import { AdminStatsClient } from "@/components/admin/AdminStatsClient";

export default async function AdminStatsPage() {
  // Commandes par mois (6 derniers mois)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, amount: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Produits par catégorie
  const productsByCategory = await prisma.product.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  // Commandes par statut
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Statistiques</h1>
        <p className="text-muted-foreground mt-1">Analyse des 6 derniers mois</p>
      </div>
      <AdminStatsClient
        orders={orders.map((o) => ({
          createdAt: o.createdAt.toISOString(),
          amount: Number(o.amount),
          status: o.status,
        }))}
        users={users.map((u) => ({ createdAt: u.createdAt.toISOString() }))}
        productsByCategory={productsByCategory.map((p) => ({
          category: p.category ?? "Autre",
          count: p._count.id,
        }))}
        ordersByStatus={ordersByStatus.map((o) => ({
          status: o.status,
          count: o._count.id,
        }))}
      />
    </div>
  );
}
