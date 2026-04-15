"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/app/lib/placeholder-images"
import { ProductCard } from "@/components/product/ProductCard"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Star, Settings, LogOut, Package, CreditCard, Bell } from "lucide-react"

export default function ProfilePage() {
  const [view, setView] = useState("public") // public or private

  const dressing = [
    { id: "1", title: "Veste en jean vintage Levi's 501", price: 45.00, size: "M", brand: "Levi's", imageUrl: PlaceHolderImages[0].imageUrl },
    { id: "3", title: "Robe d'été fleurie en soie", price: 29.50, size: "S", brand: "Zara", imageUrl: PlaceHolderImages[2].imageUrl },
    { id: "5", title: "Pull en laine tricoté main", price: 35.00, size: "TU", brand: "Fait main", imageUrl: PlaceHolderImages[4].imageUrl },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: User Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-32 bg-accent" />
            <CardContent className="px-6 pb-6 -mt-12 text-center">
              <div className="relative inline-block border-4 border-background rounded-full overflow-hidden h-24 w-24 bg-muted mb-4">
                <img src={PlaceHolderImages[6].imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold font-headline">Alexandre D.</h1>
              <p className="text-sm text-muted-foreground mb-4">@alex_vintz</p>
              
              <div className="flex justify-center items-center gap-1 mb-6">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 text-muted" />
                <span className="text-xs font-semibold ml-1">(42 avis)</span>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground text-left bg-muted/30 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Bordeaux, France</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis Jan 2023</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Button>
                <Button variant="destructive" className="gap-2 bg-red-50 text-red-500 border-red-100 hover:bg-red-100">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-bold text-sm px-2 uppercase tracking-wider text-muted-foreground">Mon compte</h3>
            {[
              { icon: Package, label: "Mes commandes" },
              { icon: CreditCard, label: "Porte-monnaie (124,00 €)" },
              { icon: Bell, label: "Notifications" },
            ].map((item) => (
              <Button key={item.label} variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                <item.icon className="h-5 w-5 text-accent" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Right: Content Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="dressing" className="w-full">
            <div className="flex items-center justify-between mb-8 border-b pb-1">
              <TabsList className="bg-transparent h-12 gap-8">
                <TabsTrigger 
                  value="dressing" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-12 text-lg"
                >
                  Dressing ({dressing.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-12 text-lg"
                >
                  À propos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dressing" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-10">
                {dressing.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    id={p.id} 
                    title={p.title} 
                    price={p.price} 
                    size={p.size} 
                    brand={p.brand} 
                    imageUrl={p.imageUrl} 
                  />
                ))}
                <div className="aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Star className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold">Vendre plus</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-bold font-headline">Bio</h3>
                  <p className="text-muted-foreground">
                    Passionné de mode vintage et de pièces uniques. Je vends principalement mes trouvailles de seconde main et des vêtements dont je ne me sers plus. Envoi rapide et soigné sous 24h.
                  </p>
                  
                  <Separator />
                  
                  <h3 className="text-xl font-bold font-headline">Langues parlées</h3>
                  <div className="flex gap-2">
                    {["Français", "Anglais"].map(l => (
                      <span key={l} className="px-3 py-1 bg-muted rounded-full text-xs font-medium">{l}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
