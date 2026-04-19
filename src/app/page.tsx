import { HomePageClient } from "@/components/home/HomePageClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const products = await prisma.product
    .findMany({
      where: { isActive: true },
      include: { owner: true, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    .catch((error) => {
      console.error("Impossible de charger les produits sur la page d'accueil.", error);
      return [];
    });

  const favorites = session?.user?.id
    ? await prisma.favorite
        .findMany({
          where: { userId: session.user.id },
          select: { productId: true },
        })
        .catch((error) => {
          console.error("Impossible de charger les favoris sur la page d'accueil.", error);
          return [];
        })
    : [];

  const favoritedIds = favorites.map((f) => f.productId);

  return (
    <HomePageClient
      favoritedIds={favoritedIds}
      products={products.map((product) => ({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        size: product.size ?? "TU",
        brand: product.brand ?? "Sans marque",
        imageUrl: product.imageUrl ?? product.imageUrls[0] ?? "https://picsum.photos/seed/fallback/600/800",
        userImage: product.owner.avatarUrl ?? undefined,
        userName: product.owner.name,
        category: product.category?.name ?? product.categoryLegacy ?? null,
        location: product.location ?? product.owner.location ?? null,
      }))}
    />
  );
}
