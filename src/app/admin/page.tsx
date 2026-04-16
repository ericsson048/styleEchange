import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { AdminRecentOrders } from "@/components/admin/AdminRecentOrders";

export default async function AdminDashboard() {
  const [usersCount, productsCount, ordersCount, paidOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, protectionFee: true, shippingFee: true },
    }),
  ]);

  const revenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.amount) + Number(o.protectionFee) + Number(o.shippingFee),
    0
  );

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { name: true, email: true } },
      product: { select: { title: true, imageUrl: true } },
    },
  });

  const stats = [
    { label: "Utilisateurs", value: usersCount, icon: Users, color: "text-blue-500" },
    { label: "Produits", value: productsCount, icon: Package, color: "text-purple-500" },
    { label: "Commandes", value: ordersCount, icon: ShoppingBag, color: "text-orange-500" },
    { label: "Revenus", value: `${revenue.toFixed(2)} €`, icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminRecentOrders orders={recentOrders.map(o => ({
            id: o.id,
            buyerName: o.buyer.name,
            buyerEmail: o.buyer.email,
            productTitle: o.product.title,
            productImage: o.product.imageUrl,
            amount: Number(o.amount),
            status: o.status,
            createdAt: o.createdAt.toISOString(),
          }))} />
        </CardContent>
      </Card>
    </div>
  );
}
