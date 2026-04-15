"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, ChevronRight } from "lucide-react"
import { PlaceHolderImages } from "@/app/lib/placeholder-images"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const CATEGORIES = ["Tout", "Femme", "Homme", "Enfants", "Maison", "Luxe", "Sport", "Divertissement"]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tout")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const products = [
    { id: "1", title: "Veste en jean vintage Levi's 501", price: 45.00, size: "M", brand: "Levi's", imageUrl: PlaceHolderImages[0].imageUrl },
    { id: "2", title: "Bottines en cuir noir Dr. Martens", price: 110.00, size: "39", brand: "Dr. Martens", imageUrl: PlaceHolderImages[1].imageUrl },
    { id: "3", title: "Robe d'été fleurie en soie", price: 29.50, size: "S", brand: "Zara", imageUrl: PlaceHolderImages[2].imageUrl },
    { id: "4", title: "Trench-coat classique Burberry", price: 450.00, size: "L", brand: "Burberry", imageUrl: PlaceHolderImages[3].imageUrl },
    { id: "5", title: "Pull en laine tricoté main", price: 35.00, size: "TU", brand: "Fait main", imageUrl: PlaceHolderImages[4].imageUrl },
    { id: "6", title: "Sneakers Nike Air Force 1", price: 75.00, size: "42", brand: "Nike", imageUrl: PlaceHolderImages[5].imageUrl },
    { id: "7", title: "Chemise en lin beige", price: 15.00, size: "S", brand: "Mango", imageUrl: PlaceHolderImages[0].imageUrl },
    { id: "8", title: "Sac à main vintage", price: 60.00, size: "M", brand: "Inconnu", imageUrl: PlaceHolderImages[1].imageUrl },
  ]

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      
      {/* Categories Scroller */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={selectedCategory === cat ? "bg-primary text-primary-foreground" : "rounded-full border-muted-foreground/20"}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Hero / Promo (Optional) */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-muted group">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/style/1200/600" 
            alt="Hero Style" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-md font-headline">
            Prêt à vider votre dressing ?
          </h1>
          <p className="text-white/90 text-lg hidden sm:block">
            Vendez vos articles en quelques clics et gagnez de l'argent.
          </p>
          <Button className="w-fit bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-bold">
            Vendre maintenant
          </Button>
        </div>
      </div>

      {/* Toolbar: Filters & Sorting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Nouveautés</h2>
          <p className="text-sm text-muted-foreground">Exploration de la catégorie: {selectedCategory}</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres avancés
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filtres</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Prix max</Label>
                <Slider defaultValue={[500]} max={1000} step={10} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 €</span>
                  <span>1000 €+</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Taille</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">XS</SelectItem>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>État</Label>
                <div className="flex flex-wrap gap-2">
                  {["Neuf", "Très bon", "Bon", "Satisfaisant"].map(s => (
                    <Button key={s} variant="outline" size="sm" className="rounded-full">{s}</Button>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full bg-accent text-accent-foreground">Voir les résultats</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <ProductCard key={i} id={String(i)} title="" price={0} size="" brand="" imageUrl="" isLoading={true} />
          ))
        ) : (
          products.map((p) => (
            <ProductCard 
              key={p.id} 
              id={p.id} 
              title={p.title} 
              price={p.price} 
              size={p.size} 
              brand={p.brand} 
              imageUrl={p.imageUrl} 
            />
          ))
        )}
      </div>

      {/* Pagination / Load more */}
      <div className="flex justify-center pt-8">
        <Button variant="ghost" className="gap-2">
          Afficher plus
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}