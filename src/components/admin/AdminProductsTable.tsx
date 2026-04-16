"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Heart, Trash2, EyeOff, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminProduct {
  id: string;
  title: string;
  price: number;
  category: string | null;
  condition: string | null;
  imageUrl: string | null;
  ownerName: string;
  ownerEmail: string;
  favoritesCount: number;
  isActive: boolean;
  reportsCount: number;
  createdAt: string;
}

export function AdminProductsTable({ products: initial }: { products: AdminProduct[] }) {
  const [products, setProducts] = useState(initial);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = async (productId: string) => {
    setLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, { method: "PATCH" });
      if (res.ok) {
        const { isActive } = await res.json();
        setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, isActive } : p));
        toast({ title: isActive ? "Article réactivé" : "Article désactivé" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setLoading(productId + "_del");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast({ title: "Produit supprimé." });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Produit</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Favoris</TableHead>
              <TableHead>Signalements</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow
                key={product.id}
                className={cn("hover:bg-muted/20", !product.isActive && "opacity-60 bg-muted/10")}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                      )}
                    </div>
                    <p className="font-medium text-sm max-w-[160px] truncate">{product.title}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{product.ownerName}</p>
                  <p className="text-xs text-muted-foreground">{product.ownerEmail}</p>
                </TableCell>
                <TableCell>
                  {product.category && (
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-sm">{product.price.toFixed(2)} €</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    {product.favoritesCount}
                  </div>
                </TableCell>
                <TableCell>
                  {product.reportsCount > 0 ? (
                    <Badge variant="destructive" className="text-xs gap-1">
                      {product.reportsCount} signalement{product.reportsCount > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                    {product.isActive ? "Actif" : "Désactivé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        product.isActive
                          ? "text-muted-foreground hover:text-orange-500 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      )}
                      onClick={() => toggleActive(product.id)}
                      disabled={loading === product.id}
                      title={product.isActive ? "Désactiver" : "Réactiver"}
                    >
                      {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteProduct(product.id)}
                      disabled={loading === product.id + "_del"}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
