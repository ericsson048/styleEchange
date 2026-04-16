"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { generateProductDescription } from "@/ai/flows/seller-ai-assisted-description-creation";
import { useToast } from "@/hooks/use-toast";
import { LocationSelector, LocationValue, locationToString } from "@/components/ui/location-selector";
import { CURRENCIES, CurrencyCode, formatPrice, SHIPPING_FEES_BIF, getProtectionFee, EXCHANGE_RATES } from "@/lib/burundi";
import { PhotoUploader } from "@/components/sell/PhotoUploader";

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [currency, setCurrency] = useState<CurrencyCode>("BIF");
  const [location, setLocation] = useState<LocationValue>({ province: "", commune: "", zone: "", colline: "" });
  const [photos, setPhotos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "", category: "", description: "",
    price: "", brand: "", condition: "", size: "",
    keywords: [] as string[],
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Calcul prix
  const inputPrice = Number(formData.price) || 0;

  const handleAiDescription = async () => {
    if (!formData.title || !formData.category) {
      toast({ title: "Informations manquantes", description: "Titre et catégorie requis.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateProductDescription({
        productTitle: formData.title,
        category: formData.category,
        initialKeywords: formData.keywords,
        briefDescription: formData.description,
      });
      if (result) {
        setFormData((prev) => ({ ...prev, description: result.detailedDescription, keywords: result.suggestedKeywords }));
        toast({ title: "Description générée !" });
      }
    } catch {
      toast({ title: "Erreur", description: "Génération échouée.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.price || Number(formData.price) <= 0) {
      toast({ title: "Prix invalide", variant: "destructive" });
      return;
    }
    if (!location.province || !location.commune) {
      toast({ title: "Localisation requise", description: "Sélectionnez au moins la province et la commune.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Convertir le prix en BIF pour le stockage
      let priceBIFToStore = Number(formData.price);
      if (currency !== "BIF") {
        priceBIFToStore = Math.round(Number(formData.price) / EXCHANGE_RATES[currency]);
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        price: priceBIFToStore,
        location: locationToString(location),
        images: photos,
        ...(formData.description && { description: formData.description }),
        ...(formData.brand && { brand: formData.brand }),
        ...(formData.condition && { condition: formData.condition }),
        ...(formData.size && { size: formData.size }),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Publication échouée.", variant: "destructive" });
        return;
      }

      toast({ title: "Article publié !", description: "Votre annonce est maintenant en ligne." });
      router.push(`/product/${data.id}`);
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? "bg-accent text-accent-foreground scale-110" : "bg-muted text-muted-foreground"}`}>
            {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {/* Step 1 — Infos de base */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold font-headline">Qu'est-ce que vous vendez ?</h2>
            <PhotoUploader photos={photos} onChange={setPhotos} />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input id="title" placeholder="ex: Chemise en coton blanc" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger id="category"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {["Femme", "Homme", "Enfants", "Maison", "Luxe", "Sport"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Localisation Burundi */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Localisation de l'article</h3>
              <LocationSelector value={location} onChange={setLocation} required />
            </div>
          </div>
        )}

        {/* Step 2 — Description */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold font-headline">Description</h2>
              <Button onClick={handleAiDescription} disabled={isAiLoading} className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground gap-2 border-accent border">
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Optimiser avec l'IA
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Description détaillée</Label>
                <Textarea id="desc" rows={6} placeholder="Décrivez l'état, la taille, la coupe..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw) => <span key={kw} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">#{kw}</span>)}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Input placeholder="ex: Levi's" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Input placeholder="ex: M, 38..." value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>État</Label>
                  <Select value={formData.condition} onValueChange={(val) => setFormData({ ...formData, condition: val })}>
                    <SelectTrigger><SelectValue placeholder="Choisir l'état" /></SelectTrigger>
                    <SelectContent>
                      {["Neuf avec étiquette", "Très bon état", "Bon état", "Satisfaisant"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Prix */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold font-headline">Prix et livraison</h2>
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-6 space-y-4">
                {/* Sélecteur de devise */}
                <div className="flex items-center gap-3">
                  <Label className="shrink-0">Devise</Label>
                  <div className="flex gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code as CurrencyCode)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${currency === c.code ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border hover:border-accent"}`}
                      >
                        {c.symbol} {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix de vente ({currency}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step={currency === "BIF" ? "100" : "0.01"}
                    placeholder={currency === "BIF" ? "ex: 15000" : "ex: 5.00"}
                    className="text-2xl font-bold"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                {formData.price && Number(formData.price) > 0 && (
                  <div className="bg-background rounded-xl p-4 space-y-2 text-sm border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Prix article</span>
                      <span>{formatPrice(Number(formData.price), currency)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frais de protection (5%)</span>
                      <span>{formatPrice(Number(formData.price) * 0.05, currency)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Livraison estimée</span>
                      <span>{formatPrice(Number(formData.price) > 0 ? (currency === "BIF" ? 5000 : 5000 * (currency === "USD" ? 0.00034 : 0.00031)) : 0, currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-accent border-t pt-2">
                      <span>Total acheteur</span>
                      <span>{formatPrice(Number(formData.price) * 1.05 + (currency === "BIF" ? 5000 : 5000 * (currency === "USD" ? 0.00034 : 0.00031)), currency)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Label>Options de livraison</Label>
              {[
                { label: "Livraison locale (même commune)", sub: "Délai : 1 jour", price: "2 000 BIF" },
                { label: "Livraison inter-province", sub: "Délai : 2-4 jours", price: "5 000 BIF" },
                { label: "Livraison express", sub: "Délai : 24h", price: "8 000 BIF" },
              ].map((opt, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border rounded-xl ${i === 1 ? "border-accent bg-accent/5" : ""}`}>
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-accent">{opt.price}</span>
                    {i === 1 && <CheckCircle2 className="h-5 w-5 text-accent" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} className="gap-2 cursor-pointer">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button
              onClick={nextStep}
              disabled={step === 1 && (!formData.title || !formData.category || !location.province || !location.commune)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 min-w-[140px] cursor-pointer"
            >
              Continuer <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={isSubmitting || !formData.price}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 min-w-[160px] cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier l'annonce"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
