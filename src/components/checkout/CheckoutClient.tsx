"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Truck, CreditCard, Check, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/ui/currency-selector";
import { SHIPPING_FEES_BIF, getProtectionFee } from "@/lib/burundi";
import { LocationSelector, LocationValue, locationToString } from "@/components/ui/location-selector";

interface Product {
  id: string;
  title: string;
  price: number; // en BIF
  imageUrl: string | null;
  size: string | null;
  condition: string | null;
  ownerName: string;
}

const SHIPPING_OPTIONS = [
  { key: "local", label: "Livraison locale (même commune)", sub: "Délai : 1 jour", feeBIF: SHIPPING_FEES_BIF.local },
  { key: "province", label: "Livraison inter-province", sub: "Délai : 2-4 jours", feeBIF: SHIPPING_FEES_BIF.province },
  { key: "express", label: "Livraison express", sub: "Délai : 24h", feeBIF: SHIPPING_FEES_BIF.express },
] as const;

export function CheckoutClient({ product }: { product: Product }) {
  const [shipping, setShipping] = useState<"local" | "province" | "express">("province");
  const [address, setAddress] = useState<LocationValue>({ province: "", commune: "", zone: "", colline: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { format } = useCurrency();

  const shippingFee = SHIPPING_OPTIONS.find(o => o.key === shipping)!.feeBIF;
  const protectionFee = getProtectionFee(product.price);
  const total = product.price + protectionFee + shippingFee;

  const handlePay = async () => {
    if (!address.province || !address.commune) {
      toast({ title: "Adresse requise", description: "Sélectionnez votre province et commune de livraison.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          shippingMethod: shipping,
          shippingAddress: locationToString(address),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Impossible de créer la session.", variant: "destructive" });
        return;
      }
      window.location.href = data.url;
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 font-headline">Commander</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">

          {/* Adresse de livraison */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationSelector value={address} onChange={setAddress} required />
            </CardContent>
          </Card>

          {/* Mode de livraison */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent" />
                Mode de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SHIPPING_OPTIONS.map((opt) => {
                const isSelected = shipping === opt.key;
                return (
                  <Label
                    key={opt.key}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all",
                      isSelected ? "border-accent bg-accent/5 ring-1 ring-accent" : "hover:bg-muted"
                    )}
                    onClick={() => setShipping(opt.key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "bg-accent border-accent" : "border-muted-foreground")}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.sub}</p>
                      </div>
                    </div>
                    <span className="font-bold text-accent shrink-0">{format(opt.feeBIF)}</span>
                  </Label>
                );
              })}
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Paiement sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/40 rounded-xl text-sm text-muted-foreground flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                <p>Vous serez redirigé vers Stripe pour finaliser votre paiement. Cartes Visa, Mastercard acceptées.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {product.imageUrl && <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="text-sm font-bold line-clamp-2">{product.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[product.size, product.condition].filter(Boolean).join(" • ")}
                  </p>
                  <p className="text-xs text-muted-foreground">Vendu par {product.ownerName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Article</span>
                  <span>{format(product.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Protection acheteurs <ShieldCheck className="h-3 w-3 text-accent" />
                  </span>
                  <span>{format(protectionFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{format(shippingFee)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold pt-1">
                <span>Total</span>
                <span className="text-accent">{format(total)}</span>
              </div>

              <Button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold shadow-xl cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Payer ${format(total)}`}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                En cliquant sur "Payer", vous acceptez nos CGV et notre Politique de Confidentialité.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
