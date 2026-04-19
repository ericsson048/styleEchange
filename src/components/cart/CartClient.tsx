"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/ui/currency-selector";

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl: string | null;
  ownerName: string;
  isActive: boolean;
  size: string | null;
  condition: string | null;
}

export function CartClient({ items: initialItems }: { items: CartItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [removing, setRemoving] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { toast } = useToast();
  const { format } = useCurrency();
  const router = useRouter();

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const protectionFee = Math.round(subtotal * 0.05);
  const shippingFee = items.length > 0 ? 5000 : 0;
  const total = subtotal + protectionFee + shippingFee;

  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        toast({ title: "Article retiré du panier." });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (items.length === 1) {
      router.push(`/checkout?productId=${items[0].productId}`);
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout/create-session-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingMethod: "province" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold font-headline">Votre panier est vide</h1>
        <p className="text-muted-foreground">Ajoutez des articles depuis la boutique.</p>
        <Link href="/">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
            Découvrir les articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline mb-8">
        Mon panier <span className="text-muted-foreground text-xl font-normal">({items.length} article{items.length > 1 ? "s" : ""})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Articles */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={`border-none shadow-sm ${!item.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative h-20 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.imageUrl && (
                    item.imageUrl.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    )
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productId}`}>
                    <p className="font-semibold text-sm hover:text-accent transition-colors truncate">{item.title}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Vendu par {item.ownerName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.size && <Badge variant="outline" className="text-xs">{item.size}</Badge>}
                    {item.condition && <Badge variant="outline" className="text-xs">{item.condition}</Badge>}
                    {!item.isActive && <Badge variant="destructive" className="text-xs">Indisponible</Badge>}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-2">
                  <p className="font-bold">{format(item.price)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => removeItem(item.id)} disabled={removing === item.id}>
                    {removing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-lg sticky top-24">
            <CardHeader><CardTitle>Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total ({items.length} articles)</span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Protection acheteurs <ShieldCheck className="h-3 w-3 text-accent" />
                  </span>
                  <span>{format(protectionFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison estimée</span>
                  <span>{format(shippingFee)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-accent">{format(total)}</span>
              </div>
              <Button onClick={handleCheckout} disabled={checkingOut || items.some((i) => !i.isActive)}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-2 cursor-pointer">
                {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Commander <ArrowRight className="h-5 w-5" /></>}
              </Button>
              {items.some((i) => !i.isActive) && (
                <p className="text-xs text-destructive text-center">Retirez les articles indisponibles pour continuer.</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                <span>Paiement sécurisé via Stripe avec 3D Secure</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
