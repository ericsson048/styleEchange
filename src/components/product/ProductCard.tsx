"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductCardProps {
  id: string
  title: string
  price: number
  size: string
  brand: string
  imageUrl: string
  userImage?: string
  userName?: string
  isLoading?: boolean
}

export function ProductCard({
  id,
  title,
  price,
  size,
  brand,
  imageUrl,
  userImage,
  userName,
  isLoading = false
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  return (
    <div className="group relative flex flex-col gap-2">
      {/* Seller info */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted">
          <Image 
            src={userImage || "https://picsum.photos/seed/user/100/100"} 
            alt={userName || "Seller"}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground truncate">{userName || "Vendeur"}</span>
      </div>

      {/* Product Image */}
      <Link href={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {!isImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-110",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoadingComplete={() => setIsImageLoaded(true)}
          data-ai-hint="product photo"
        />
        
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className={cn(
              "p-2 rounded-full transition-all active:scale-90 shadow-sm",
              isFavorite ? "bg-red-50 text-red-500" : "bg-white/80 backdrop-blur-sm text-primary hover:bg-white"
            )}
          >
            <Heart className={cn("h-5 w-5 transition-colors", isFavorite && "fill-current")} />
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start gap-2">
          <span className="font-bold text-lg">{price.toFixed(2)} €</span>
          <span className="text-xs text-muted-foreground uppercase">{size}</span>
        </div>
        <span className="text-sm text-muted-foreground truncate">{brand}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">{title}</span>
      </div>
    </div>
  )
}