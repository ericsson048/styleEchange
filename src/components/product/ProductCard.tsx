"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/components/ui/currency-selector";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  size: string;
  brand: string;
  imageUrl: string;
  userImage?: string;
  userName?: string;
  isFavorited?: boolean;
  isLoading?: boolean;
}

export function ProductCard({
  id, title, price, size, brand, imageUrl,
  userImage, userName, isFavorited = false, isLoading = false,
}: ProductCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { format } = useCurrency();
  const { data: session } = useSession();
  const router = useRouter();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(`/auth/login?callbackUrl=/product/${id}`);
      return;
    }

    setFavLoading(true);
    const next = !favorited;
    setFavorited(next); // optimistic

    try {
      if (next) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id }),
        });
      } else {
        await fetch(`/api/favorites?productId=${id}`, { method: "DELETE" });
      }
    } catch {
      setFavorited(!next); // rollback
    } finally {
      setFavLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted">
          <Image
            src={userImage || "https://picsum.photos/seed/user/100/100"}
            alt={userName || "Vendeur"}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground truncate">{userName || "Vendeur"}</span>
      </div>

      <Link href={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {!isImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
        {imageUrl.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => setIsImageLoaded(true)}
          />
        ) : (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-110",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
        )}

        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={cn(
              "p-2 rounded-full transition-all active:scale-90 shadow-sm cursor-pointer",
              favorited
                ? "bg-red-50 text-red-500"
                : "bg-white/80 backdrop-blur-sm text-primary hover:bg-white"
            )}
            aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={cn("h-5 w-5 transition-all", favorited && "fill-current", favLoading && "opacity-50")} />
          </button>
        </div>
      </Link>

      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start gap-2">
          <span className="font-bold text-base">{format(price)}</span>
          <span className="text-xs text-muted-foreground uppercase">{size}</span>
        </div>
        <span className="text-sm text-muted-foreground truncate">{brand}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">{title}</span>
      </div>
    </div>
  );
}
