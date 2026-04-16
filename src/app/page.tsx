import { HomePageClient } from "@/components/home/HomePageClient";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    where: { isActive: true },
  });

  const mapped = products.map((product) => ({
    id: product.id,
    title: product.title,
    price: Number(product.price),
    size: product.size ?? "TU",
    brand: product.brand ?? "Sans marque",
    imageUrl: product.imageUrl ?? product.imageUrls[0] ?? "https://picsum.photos/seed/fallback/600/800",
    userImage: product.owner.avatarUrl ?? undefined,
    userName: product.owner.name,
    category: product.category,
    location: product.location ?? product.owner.location ?? null,
  }));

  return <HomePageClient products={mapped} />;
}
