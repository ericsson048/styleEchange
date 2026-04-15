"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Share2, ShieldCheck, MessageCircle, Info } from "lucide-react"
import { PlaceHolderImages } from "@/app/lib/placeholder-images"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  // Mock data for display
  const product = {
    title: "Veste en jean vintage Levi's 501",
    price: 45.00,
    size: "M",
    brand: "Levi's",
    condition: "Très bon état",
    color: "Bleu délavé",
    location: "Paris, France",
    description: "Authentique veste Levi's des années 90. Très bien entretenue, denim épais de qualité supérieure. Coupe légèrement oversize parfaite pour un look vintage.",
    images: [PlaceHolderImages[0].imageUrl, PlaceHolderImages[1].imageUrl, PlaceHolderImages[4].imageUrl],
    seller: {
      name: "Marie Vintage",
      rating: 4.8,
      reviews: 124,
      avatar: PlaceHolderImages[6].imageUrl
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Gallery */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 aspect-[4/5] relative rounded-2xl overflow-hidden bg-muted">
            <Image 
              src={product.images[0]} 
              alt={product.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
          {product.images.slice(1).map((img, i) => (
            <div key={i} className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-muted">
              <Image src={img} alt={`${product.title} ${i+2}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h1 className="text-4xl font-bold font-headline">{product.price.toFixed(2)} €</h1>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  + 2,25 € frais de protection <Info className="h-3 w-3" />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <span className="text-muted-foreground">MARQUE</span>
                <span className="font-semibold">{product.brand}</span>
                <span className="text-muted-foreground">TAILLE</span>
                <span className="font-semibold">{product.size}</span>
                <span className="text-muted-foreground">ÉTAT</span>
                <span className="font-semibold">{product.condition}</span>
                <span className="text-muted-foreground">COULEUR</span>
                <span className="font-semibold">{product.color}</span>
                <span className="text-muted-foreground">EMPLACEMENT</span>
                <span className="font-semibold">{product.location}</span>
              </div>

              <Separator />

              <div className="space-y-4">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg font-bold">
                  Acheter
                </Button>
                <Button variant="outline" className="w-full h-12 text-lg gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted">
                  <Image src={product.seller.avatar} alt={product.seller.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{product.seller.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {product.seller.rating} ({product.seller.reviews} avis)
                  </p>
                </div>
              </div>
              <Separator className="mb-4" />
              <Link href="/profile">
                <Button variant="link" className="w-full text-accent p-0 justify-start">
                  Voir tout son dressing →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <p>Notre protection acheteur s'applique à tous les achats effectués via le bouton "Acheter".</p>
          </div>
        </div>
      </div>
    </div>
  )
}