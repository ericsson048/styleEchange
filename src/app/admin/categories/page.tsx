import { prisma } from "@/lib/prisma";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Catégories</h1>
        <p className="text-muted-foreground mt-1">{categories.length} catégories</p>
      </div>
      <AdminCategoriesClient categories={categories.map((c) => ({
        id: c.id, name: c.name, slug: c.slug,
        description: c.description, isActive: c.isActive,
        productsCount: c._count.products,
        createdAt: c.createdAt.toISOString(),
      }))} />
    </div>
  );
}
