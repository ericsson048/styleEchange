import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/favorites");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: { include: { owner: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-7 w-7 text-accent fill-accent" />
        <h1 className="text-3xl font-bold font-headline">Mes favoris</h1>
        <span className="text-muted-foreground text-lg">({favorites.length})</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
          <p className="text-xl font-semibold">Aucun favori pour l'instant</p>
          <p className="text-muted-foreground">Cliquez sur le cœur d'un article pour le retrouver ici.</p>
          <Link href="/">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
              Découvrir les articles
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
          {favorites.map(({ product }) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={Number(product.price)}
              size={product.size ?? "TU"}
              brand={product.brand ?? "Sans marque"}
              imageUrl={product.imageUrl ?? product.imageUrls[0] ?? "https://picsum.photos/seed/fallback/600/800"}
              userName={product.owner.name}
              userImage={product.owner.avatarUrl ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
