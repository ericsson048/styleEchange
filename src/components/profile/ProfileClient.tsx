"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product/ProductCard";
import { Calendar, LogOut, MapPin, Package, Settings, Star, Shield, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  PAID: { label: "Payé", variant: "default" },
  SHIPPED: { label: "Expédié", variant: "outline" },
  DELIVERED: { label: "Livré", variant: "default" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  REFUNDED: { label: "Remboursé", variant: "destructive" },
};

interface ProfileUser {
  id: string; name: string; username: string; email: string;
  avatarUrl: string | null; location: string | null;
  rating: number | null; reviewsCount: number | null;
  createdAt: string; role: string;
}
interface DressingProduct {
  id: string; title: string; price: number; size: string;
  brand: string; imageUrl: string; userName: string; userImage?: string;
}
interface Order {
  id: string; productTitle: string; productImage: string | null;
  amount: number; protectionFee: number; shippingFee: number;
  status: string; createdAt: string;
}
interface Sale extends Order {
  buyerName: string; buyerAvatar: string | null;
}
interface Props {
  user: ProfileUser;
  dressing: DressingProduct[];
  orders: Order[];
  sales: Sale[];
  defaultTab?: string;
}

function OrderCard({ order, total, statusInfo }: { order: Order; total: number; statusInfo: { label: string; variant: any } }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
          {order.productImage && (
            order.productImage.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.productImage} alt={order.productTitle} className="w-full h-full object-cover" />
            ) : (
              <Image src={order.productImage} alt={order.productTitle} fill className="object-cover" />
            )
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{order.productTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(order.createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <p className="font-bold text-sm">{total.toLocaleString("fr-BI")} BIF</p>
          <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SaleCard({ sale }: { sale: Sale }) {
  const [status, setStatus] = useState(sale.status);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const total = sale.amount + sale.protectionFee + sale.shippingFee;
  const statusInfo = STATUS_LABELS[status] ?? { label: status, variant: "secondary" as const };

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${sale.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        toast({ title: "Statut mis à jour." });
      } else {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
            {sale.productImage && (
              sale.productImage.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sale.productImage} alt={sale.productTitle} className="w-full h-full object-cover" />
              ) : (
                <Image src={sale.productImage} alt={sale.productTitle} fill className="object-cover" />
              )
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{sale.productTitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-5 w-5 rounded-full overflow-hidden bg-muted shrink-0">
                {sale.buyerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sale.buyerAvatar} alt={sale.buyerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                    {sale.buyerName[0]}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{sale.buyerName}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(sale.createdAt), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="text-right shrink-0 space-y-2">
            <p className="font-bold text-sm">{total.toLocaleString("fr-BI")} BIF</p>
            <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Vendeur peut marquer expédié ou livré */}
        {(status === "PAID" || status === "SHIPPED") && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mettre à jour :</span>
            <Select onValueChange={updateStatus} disabled={loading}>
              <SelectTrigger className="h-7 text-xs w-40">
                <SelectValue placeholder="Changer statut" />
              </SelectTrigger>
              <SelectContent>
                {status === "PAID" && <SelectItem value="SHIPPED" className="text-xs">Marquer expédié</SelectItem>}
                {status === "SHIPPED" && <SelectItem value="DELIVERED" className="text-xs">Marquer livré</SelectItem>}
              </SelectContent>
            </Select>
            {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileClient({ user, dressing, orders, sales, defaultTab = "dressing" }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const rating = user.rating ?? 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-32 bg-accent" />
            <CardContent className="px-6 pb-6 -mt-12 text-center">
              <div className="relative inline-block border-4 border-background rounded-full overflow-hidden h-24 w-24 bg-muted mb-4">
                <img src={user.avatarUrl ?? `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
              <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
              {user.role === "ADMIN" && (
                <Badge className="mb-3 gap-1 bg-accent text-accent-foreground"><Shield className="h-3 w-3" /> Admin</Badge>
              )}
              <div className="flex justify-center items-center gap-0.5 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < fullStars ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
                <span className="text-xs font-semibold ml-1">({user.reviewsCount ?? 0} avis)</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground text-left bg-muted/30 p-4 rounded-xl">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /><span>{user.location ?? "Burundi"}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" /><span>Membre depuis {format(new Date(user.createdAt), "MMMM yyyy", { locale: fr })}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" className="gap-2 cursor-pointer"><Settings className="h-4 w-4" />Paramètres</Button>
                <Button variant="outline" className="gap-2 bg-red-50 text-red-500 border-red-100 hover:bg-red-100 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" />Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1">
            <h3 className="font-bold text-xs px-2 uppercase tracking-wider text-muted-foreground mb-2">Mon compte</h3>
            {[
              { value: "orders", icon: Package, label: `Mes achats (${orders.length})` },
              { value: "sales", icon: ShoppingBag, label: `Mes ventes (${sales.length})` },
            ].map((item) => (
              <Button key={item.value} variant={activeTab === item.value ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12 text-base cursor-pointer"
                onClick={() => setActiveTab(item.value)}>
                <item.icon className="h-5 w-5 text-accent" />{item.label}
              </Button>
            ))}
            {user.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base cursor-pointer text-accent">
                  <Shield className="h-5 w-5" />Administration
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b pb-1 mb-8">
              <TabsList className="bg-transparent h-12 gap-4 flex-wrap">
                {[
                  { value: "dressing", label: `Dressing (${dressing.length})` },
                  { value: "orders", label: `Achats (${orders.length})` },
                  { value: "sales", label: `Ventes (${sales.length})` },
                  { value: "about", label: "À propos" },
                ].map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-12 text-base">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Dressing */}
            <TabsContent value="dressing" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-10">
                {dressing.map((p) => <ProductCard key={p.id} {...p} />)}
                <Link href="/sell">
                  <div className="aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent cursor-pointer transition-all">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent"><Plus className="h-6 w-6" /></div>
                    <span className="text-xs font-bold">Vendre un article</span>
                  </div>
                </Link>
              </div>
              {dressing.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">Aucun article en vente.</p>}
            </TabsContent>

            {/* Achats */}
            <TabsContent value="orders" className="mt-0">
              {orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Aucune commande pour l'instant.</p>
                  <Link href="/"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">Découvrir les articles</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const total = order.amount + order.protectionFee + order.shippingFee;
                    const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: "secondary" as const };
                    return <OrderCard key={order.id} order={order} total={total} statusInfo={statusInfo} />;
                  })}
                </div>
              )}
            </TabsContent>

            {/* Ventes */}
            <TabsContent value="sales" className="mt-0">
              {sales.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Aucune vente pour l'instant.</p>
                  <Link href="/sell"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">Mettre un article en vente</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sales.map((sale) => <SaleCard key={sale.id} sale={sale} />)}
                </div>
              )}
            </TabsContent>

            {/* À propos */}
            <TabsContent value="about" className="mt-0">
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-bold font-headline">Bio</h3>
                  <p className="text-muted-foreground">Passionné(e) de mode et de pièces uniques. Envoi rapide et soigné.</p>
                  <Separator />
                  <h3 className="text-xl font-bold font-headline">Langues parlées</h3>
                  <div className="flex gap-2">
                    {["Français", "Kirundi"].map((l) => (
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
  );
}
