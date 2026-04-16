import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, Info, Share2, ShieldCheck, Ban, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BuyButton } from "@/components/product/BuyButton";
import { ReportDialog } from "@/components/product/ReportDialog";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { StarRating } from "@/components/reviews/StarRating";
import { MessageSellerButton } from "@/components/product/MessageSellerButton";
import { resolveLocationCoords } from "@/lib/burundi";
import { ProductLocationMapWrapper } from "@/components/map/ProductLocationMapWrapper";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!product) notFound();

  // Produit désactivé : seul l'admin peut le voir
  if (!product.isActive && (session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <Ban className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Article indisponible</h1>
        <p className="text-muted-foreground">Cet article a été désactivé par notre équipe de modération.</p>
        <Link href="/"><Button className="bg-accent text-accent-foreground hover:bg-accent/90">Retour à l'accueil</Button></Link>
      </div>
    );
  }

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl ?? "https://picsum.photos/seed/fallback/600/800"];

  const isOwner = currentUserId === product.ownerId;
  const locationLabel = product.location ?? product.owner.location ?? null;
  const locationCoords = resolveLocationCoords(locationLabel);

  // Avis existant de l'utilisateur connecté sur ce vendeur
  const existingReview = currentUserId
    ? await prisma.review.findUnique({
        where: { authorId_targetId: { authorId: currentUserId, targetId: product.ownerId } },
        select: { rating: true },
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bannière produit désactivé (admin uniquement) */}
      {!product.isActive && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
          <Ban className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            Cet article est désactivé (visible uniquement par les administrateurs).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 aspect-[4/5] relative rounded-2xl overflow-hidden bg-muted">
            {images[0].startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <Image src={images[0]} alt={product.title} fill className="object-cover" priority />
            )}
          </div>
          {images.slice(1).map((img, i) => (
            <div key={i} className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-muted">
              {img.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={`${product.title} ${i + 2}`} className="w-full h-full object-cover" />
              ) : (
                <Image src={img} alt={`${product.title} ${i + 2}`} fill className="object-cover" />
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h1 className="text-4xl font-bold font-headline">
                    {Number(product.price).toLocaleString("fr-BI")} BIF
                  </h1>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 cursor-pointer">
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 cursor-pointer">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  + frais de protection (5%) <Info className="h-3 w-3" />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">MARQUE</span>
                <span className="font-semibold">{product.brand ?? "Sans marque"}</span>
                <span className="text-muted-foreground">TAILLE</span>
                <span className="font-semibold">{product.size ?? "TU"}</span>
                <span className="text-muted-foreground">ÉTAT</span>
                <span className="font-semibold">{product.condition ?? "Non renseigné"}</span>
                <span className="text-muted-foreground">COULEUR</span>
                <span className="font-semibold">{product.color ?? "Non renseignée"}</span>
                <span className="text-muted-foreground">EMPLACEMENT</span>
                <span className="font-semibold">{product.location ?? product.owner.location ?? "Burundi"}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <h2 className="font-bold text-lg">{product.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {product.description ?? "Le vendeur n'a pas encore ajouté de description."}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                {!isOwner && product.isActive && <BuyButton productId={product.id} />}
                {isOwner && (
                  <div className="p-3 bg-muted/40 rounded-xl text-sm text-muted-foreground text-center">
                    C'est votre article
                  </div>
                )}
                {!isOwner && (
                  <MessageSellerButton
                    sellerId={product.ownerId}
                    sellerName={product.owner.name}
                    productId={product.id}
                    productTitle={product.title}
                  />
                )}
                {/* Signaler — visible uniquement si connecté et pas propriétaire */}
                {currentUserId && !isOwner && (
                  <div className="flex justify-center pt-1">
                    <ReportDialog productId={product.id} productTitle={product.title} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vendeur */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted shrink-0">
                  <Image
                    src={product.owner.avatarUrl ?? `https://picsum.photos/seed/${product.owner.id}/100/100`}
                    alt={product.owner.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{product.owner.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating value={product.owner.rating ?? 0} readonly size="sm" />
                    <span className="text-xs text-muted-foreground">
                      ({product.owner.reviewsCount ?? 0} avis)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href={`/profile`}>
                  <Button variant="link" className="text-accent p-0 cursor-pointer text-sm">
                    Voir son dressing →
                  </Button>
                </Link>
                {/* Bouton noter le vendeur — si connecté, pas propriétaire */}
                {currentUserId && !isOwner && (
                  <ReviewDialog
                    targetId={product.ownerId}
                    targetName={product.owner.name}
                    existingRating={existingReview?.rating}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avis sur le vendeur */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Avis sur le vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewsList targetId={product.ownerId} />
            </CardContent>
          </Card>

          {/* Carte de localisation */}
          {locationCoords && (
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  Localisation
                </CardTitle>
                <p className="text-xs text-muted-foreground">{locationLabel}</p>
              </CardHeader>
              <CardContent className="p-0">
                <ProductLocationMapWrapper
                  coords={locationCoords}
                  label={locationLabel ?? "Burundi"}
                  height="220px"
                />
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
            <p>Notre protection acheteur s'applique à tous les achats effectués via le bouton "Acheter".</p>
          </div>
        </div>
      </div>
    </div>
  );
}
