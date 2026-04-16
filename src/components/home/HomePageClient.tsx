"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Map, LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Chargement dynamique pour éviter les erreurs SSR avec mapbox-gl
const ProductsMapView = dynamic(
  () => import("@/components/map/ProductsMapView").then((m) => m.ProductsMapView),
  { ssr: false, loading: () => <div className="h-[420px] rounded-2xl bg-muted animate-pulse" /> }
);

const CATEGORIES = ["Tout", "Femme", "Homme", "Enfants", "Maison", "Luxe", "Sport"];

type HomeProduct = {
  id: string;
  title: string;
  price: number;
  size: string;
  brand: string;
  imageUrl: string;
  userImage?: string;
  userName?: string;
  category?: string | null;
  location?: string | null;
};

export function HomePageClient({ products }: { products: HomeProduct[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tout") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Catégories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={`shrink-0 rounded-full ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "border-muted-foreground/20"}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Hero */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-muted">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/burundi-fashion/1200/600" alt="Hero" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-md font-headline">
            Mode & Style au Burundi
          </h1>
          <p className="text-white/90 text-lg hidden sm:block">
            Achetez et vendez des articles de mode partout au Burundi.
          </p>
          <Link href="/sell">
            <Button className="w-fit bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-bold">
              Vendre maintenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Nouveautés</h2>
          <p className="text-sm text-muted-foreground">{filteredProducts.length} articles · {selectedCategory}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle grille / carte */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${viewMode === "grid" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grille</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${viewMode === "map" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Carte</span>
            </button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Filtres avancés</DialogTitle></DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label>Prix max (BIF)</Label>
                  <Slider defaultValue={[500000]} max={2000000} step={10000} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 BIF</span><span>2 000 000 BIF+</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Choisir une taille" /></SelectTrigger>
                    <SelectContent>
                      {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>État</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Neuf", "Très bon", "Bon", "Satisfaisant"].map((state) => (
                      <Button key={state} variant="outline" size="sm" className="rounded-full">{state}</Button>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full bg-accent text-accent-foreground">Appliquer</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vue carte */}
      {viewMode === "map" && (
        <ProductsMapView
          products={filteredProducts.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            imageUrl: p.imageUrl,
            location: p.location ?? null,
            ownerName: p.userName ?? "Vendeur",
          }))}
        />
      )}

      {/* Vue grille */}
      {viewMode === "grid" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                size={product.size}
                brand={product.brand}
                imageUrl={product.imageUrl}
                userImage={product.userImage}
                userName={product.userName}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              Aucun article dans cette catégorie pour le moment.
            </p>
          )}
          <div className="flex justify-center pt-4">
            <Button variant="ghost" className="gap-2">
              Afficher plus <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
