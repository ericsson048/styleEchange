"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Map, LayoutGrid, Search, X, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const ProductsMapView = dynamic(
  () => import("@/components/map/ProductsMapView").then((m) => m.ProductsMapView),
  { ssr: false, loading: () => <div className="h-[420px] rounded-2xl bg-muted animate-pulse" /> }
);

const CATEGORIES = ["Tout", "Femme", "Homme", "Enfants", "Maison", "Luxe", "Sport"];
const CONDITIONS = ["Neuf avec étiquette", "Très bon état", "Bon état", "Satisfaisant"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"];

type HomeProduct = {
  id: string; title: string; price: number; size: string; brand: string;
  imageUrl: string; userImage?: string; userName?: string;
  category?: string | null; location?: string | null; isFavorited?: boolean;
};

interface Filters {
  size: string; condition: string; maxPrice: number; brand: string;
}

const DEFAULT_FILTERS: Filters = { size: "", condition: "", maxPrice: 2_000_000, brand: "" };

export function HomePageClient({ products: initialProducts, favoritedIds = [] }: {
  products: HomeProduct[];
  favoritedIds?: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchResults, setSearchResults] = useState<HomeProduct[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 20);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

  const activeFiltersCount = [
    filters.size, filters.condition, filters.brand,
    filters.maxPrice < 2_000_000 ? "price" : "",
  ].filter(Boolean).length;

  // Recherche via API
  const doSearch = useCallback(async (q: string, cat: string, f: Filters, p = 1) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q, category: cat,
        ...(f.size && { size: f.size }),
        ...(f.condition && { condition: f.condition }),
        ...(f.brand && { q: `${q} ${f.brand}`.trim() }),
        maxPrice: String(f.maxPrice),
        page: String(p),
      });
      const res = await fetch(`/api/products/search?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      if (p === 1) {
        setSearchResults(data.products);
      } else {
        setSearchResults((prev) => [...(prev ?? []), ...data.products]);
      }
      setHasMore(data.hasMore);
      setPage(p);
    } catch {} finally {
      setIsSearching(false);
    }
  }, []);

  // Déclenche la recherche quand query ou catégorie change
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q && selectedCategory === "Tout" && activeFiltersCount === 0) {
      setSearchResults(null);
      return;
    }
    startTransition(() => doSearch(q, selectedCategory, filters, 1));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    startTransition(() => doSearch(searchQuery, cat, filters, 1));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    startTransition(() => doSearch(searchQuery, selectedCategory, pendingFilters, 1));
  };

  const resetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    startTransition(() => doSearch(searchQuery, selectedCategory, DEFAULT_FILTERS, 1));
  };

  const loadMore = () => {
    if (searchResults !== null) {
      doSearch(searchQuery, selectedCategory, filters, page + 1);
    } else {
      // Pagination sur les produits initiaux
      fetch(`/api/products/search?page=${page + 1}&category=${selectedCategory}`)
        .then((r) => r.json())
        .then((data) => {
          setAllProducts((prev) => [...prev, ...data.products]);
          setHasMore(data.hasMore);
          setPage(page + 1);
        });
    }
  };

  const displayProducts = searchResults ?? allProducts;
  const filteredDisplay = useMemo(() => {
    if (searchResults !== null) return displayProducts;
    if (selectedCategory === "Tout") return displayProducts;
    return displayProducts.filter((p) => p.category === selectedCategory);
  }, [displayProducts, selectedCategory, searchResults]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">

      {/* Catégories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <Button key={cat} onClick={() => handleCategoryChange(cat)}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={cn("shrink-0 rounded-full transition-all",
              selectedCategory === cat ? "bg-primary text-primary-foreground" : "border-muted-foreground/20"
            )}>
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
          <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-md font-headline">Mode & Style au Burundi</h1>
          <p className="text-white/90 text-lg hidden sm:block">Achetez et vendez des articles de mode partout au Burundi.</p>
          <Link href="/sell">
            <Button className="w-fit bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg font-bold">
              Vendre maintenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, marque, description..."
          className="pl-12 pr-12 h-12 text-base bg-card border shadow-sm rounded-xl"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => handleSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-accent" />
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">
            {searchQuery ? `Résultats pour "${searchQuery}"` : "Nouveautés"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredDisplay.length} article{filteredDisplay.length > 1 ? "s" : ""} · {selectedCategory}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle grille / carte */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")}
              className={cn("px-3 py-2 flex items-center gap-1.5 text-sm transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-accent text-accent-foreground" : "hover:bg-muted")}>
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grille</span>
            </button>
            <button onClick={() => setViewMode("map")}
              className={cn("px-3 py-2 flex items-center gap-1.5 text-sm transition-colors cursor-pointer",
                viewMode === "map" ? "bg-accent text-accent-foreground" : "hover:bg-muted")}>
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Carte</span>
            </button>
          </div>

          {/* Filtres avancés */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 relative">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader><DialogTitle>Filtres avancés</DialogTitle></DialogHeader>
              <div className="grid gap-5 py-4">
                {/* Marque */}
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Input placeholder="ex: Levi's, Zara, Nike..."
                    value={pendingFilters.brand}
                    onChange={(e) => setPendingFilters({ ...pendingFilters, brand: e.target.value })} />
                </div>

                {/* Taille */}
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button key={s} onClick={() => setPendingFilters({ ...pendingFilters, size: pendingFilters.size === s ? "" : s })}
                        className={cn("px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer",
                          pendingFilters.size === s ? "bg-accent text-accent-foreground border-accent" : "hover:border-accent")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* État */}
                <div className="space-y-2">
                  <Label>État</Label>
                  <Select value={pendingFilters.condition}
                    onValueChange={(v) => setPendingFilters({ ...pendingFilters, condition: v === "all" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Tous les états" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les états</SelectItem>
                      {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix max */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Prix maximum</Label>
                    <span className="text-sm font-semibold text-accent">
                      {pendingFilters.maxPrice >= 2_000_000 ? "Illimité" : `${pendingFilters.maxPrice.toLocaleString("fr-BI")} BIF`}
                    </span>
                  </div>
                  <Slider
                    value={[pendingFilters.maxPrice]}
                    min={0} max={2_000_000} step={10_000}
                    onValueChange={([v]) => setPendingFilters({ ...pendingFilters, maxPrice: v })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 BIF</span><span>2 000 000 BIF</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>Réinitialiser</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={applyFilters}>
                  Appliquer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 -mt-4">
          {filters.brand && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setFilters({ ...filters, brand: "" }); setPendingFilters({ ...pendingFilters, brand: "" }); }}>
              Marque: {filters.brand} <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.size && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setFilters({ ...filters, size: "" }); setPendingFilters({ ...pendingFilters, size: "" }); }}>
              Taille: {filters.size} <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.condition && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setFilters({ ...filters, condition: "" }); setPendingFilters({ ...pendingFilters, condition: "" }); }}>
              {filters.condition} <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.maxPrice < 2_000_000 && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setFilters({ ...filters, maxPrice: 2_000_000 }); setPendingFilters({ ...pendingFilters, maxPrice: 2_000_000 }); }}>
              Max: {filters.maxPrice.toLocaleString("fr-BI")} BIF <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Vue carte */}
      {viewMode === "map" && (
        <ProductsMapView products={filteredDisplay.map((p) => ({
          id: p.id, title: p.title, price: p.price,
          imageUrl: p.imageUrl, location: p.location ?? null, ownerName: p.userName ?? "Vendeur",
        }))} />
      )}

      {/* Vue grille */}
      {viewMode === "grid" && (
        <>
          {isSearching && searchResults === null ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDisplay.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Search className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-semibold">Aucun résultat</p>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? `Aucun article pour "${searchQuery}"` : "Aucun article dans cette catégorie."}
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <Button variant="outline" onClick={() => { handleSearch(""); resetFilters(); }}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {filteredDisplay.map((product) => (
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
                  isFavorited={favoritedIds.includes(product.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {hasMore && filteredDisplay.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={isSearching} className="gap-2 min-w-[160px]">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Afficher plus <ChevronRight className="h-4 w-4" /></>}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
