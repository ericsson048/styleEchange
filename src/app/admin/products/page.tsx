import { prisma } from "@/lib/prisma";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      owner: { select: { name: true, email: true } },
      _count: { select: { favorites: true, reports: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Produits</h1>
        <p className="text-muted-foreground mt-1">{products.length} articles publiés</p>
      </div>
      <AdminProductsTable
        products={products.map((p) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          category: p.category?.name ?? p.categoryLegacy ?? null,
          condition: p.condition,
          imageUrl: p.imageUrl,
          ownerName: p.owner.name,
          ownerEmail: p.owner.email,
          favoritesCount: p._count.favorites,
          isActive: p.isActive,
          reportsCount: p._count.reports,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
