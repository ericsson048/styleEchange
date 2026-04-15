"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, MapPin, Truck, CreditCard, ChevronRight, Check } from "lucide-react"
import { PlaceHolderImages } from "@/app/lib/placeholder-images"
import Image from "next/image"

export default function CheckoutPage() {
  const [shipping, setShipping] = useState("relay")

  const cart = {
    title: "Veste en jean vintage Levi's 501",
    price: 45.00,
    protection: 2.25,
    shipping: 3.50,
    imageUrl: PlaceHolderImages[0].imageUrl
  }

  const total = cart.price + cart.protection + cart.shipping

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 font-headline">Commander</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Adresse de livraison
              </CardTitle>
              <Button variant="link" className="text-accent p-0">Modifier</Button>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-bold">Alexandre Dupont</p>
              <p className="text-muted-foreground">15 Rue de la Mode, 33000 Bordeaux</p>
              <p className="text-muted-foreground">+33 6 00 00 00 00</p>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent" />
                Mode de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shipping} onValueChange={setShipping} className="space-y-3">
                <Label 
                  htmlFor="relay" 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all",
                    shipping === "relay" ? "border-accent bg-accent/5 ring-1 ring-accent" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="relay" id="relay" className="sr-only" />
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      shipping === "relay" ? "bg-accent border-accent" : "bg-white"
                    )}>
                      {shipping === "relay" && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-bold">Mondial Relay - Point Relais</p>
                      <p className="text-xs text-muted-foreground">Arrivée estimée : 3-5 jours</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent">3,50 €</span>
                </Label>

                <Label 
                  htmlFor="home" 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all",
                    shipping === "home" ? "border-accent bg-accent/5 ring-1 ring-accent" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="home" id="home" className="sr-only" />
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      shipping === "home" ? "bg-accent border-accent" : "bg-white"
                    )}>
                      {shipping === "home" && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-bold">Livraison à domicile (Colissimo)</p>
                      <p className="text-xs text-muted-foreground">Arrivée estimée : 2-3 jours</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent">6,90 €</span>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-accent bg-accent/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-primary rounded flex items-center justify-center text-[10px] text-white font-bold">VISA</div>
                  <div>
                    <p className="text-sm font-bold">**** **** **** 4242</p>
                    <p className="text-xs text-muted-foreground">Expire 12/26</p>
                  </div>
                </div>
                <Button variant="link" className="text-accent text-xs">Changer</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <Image src={cart.imageUrl} alt={cart.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="text-sm font-bold truncate">{cart.title}</h4>
                  <p className="text-xs text-muted-foreground">Taille M • État Très bon</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Article</span>
                  <span>{cart.price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Protection acheteurs <ShieldCheck className="h-3 w-3 text-accent" />
                  </span>
                  <span>{cart.protection.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>{cart.shipping.toFixed(2)} €</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-accent">{total.toFixed(2)} €</span>
              </div>

              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold mt-4 shadow-xl active:scale-[0.98] transition-transform">
                Payer {total.toFixed(2)} €
              </Button>

              <p className="text-[10px] text-center text-muted-foreground mt-4">
                En cliquant sur "Payer", vous acceptez nos Conditions Générales de Vente et notre Politique de Confidentialité.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}