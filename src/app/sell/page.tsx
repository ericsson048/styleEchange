"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { generateProductDescription } from "@/ai/flows/seller-ai-assisted-description-creation"
import { useToast } from "@/hooks/use-toast"

export default function SellPage() {
  const [step, setStep] = useState(1)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    brand: "",
    condition: "",
    keywords: [] as string[]
  })

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleAiDescription = async () => {
    if (!formData.title || !formData.category) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez saisir un titre et une catégorie avant d'utiliser l'IA.",
        variant: "destructive"
      })
      return
    }

    setIsAiLoading(true)
    try {
      const result = await generateProductDescription({
        productTitle: formData.title,
        category: formData.category,
        initialKeywords: formData.keywords,
        briefDescription: formData.description
      })

      if (result) {
        setFormData(prev => ({
          ...prev,
          description: result.detailedDescription,
          keywords: result.suggestedKeywords
        }))
        toast({
          title: "Description générée !",
          description: "L'IA a optimisé votre annonce pour attirer plus d'acheteurs."
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération. Réessayez.",
        variant: "destructive"
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? "bg-accent text-accent-foreground scale-110" : "bg-muted text-muted-foreground"
            }`}
          >
            {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold font-headline">Qu'est-ce que vous vendez ?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent cursor-pointer transition-all">
                <Camera className="h-8 w-8" />
                <span className="text-xs">Ajouter photos</span>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-xl" />
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce</Label>
                <Input 
                  id="title" 
                  placeholder="ex: Chemise Zara en lin bleu" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Enfants">Enfants</SelectItem>
                    <SelectItem value="Maison">Maison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold font-headline">Description de l'article</h2>
              <Button 
                onClick={handleAiDescription} 
                disabled={isAiLoading}
                className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground gap-2 border-accent border"
              >
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Optimiser avec l'IA
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Description détaillée</Label>
                <Textarea 
                  id="desc" 
                  rows={8} 
                  placeholder="Décrivez l'état, la taille, la coupe..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(kw => (
                    <span key={kw} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">#{kw}</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Input placeholder="ex: Levi's" />
                </div>
                <div className="space-y-2">
                  <Label>État</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neuf avec étiquette</SelectItem>
                      <SelectItem value="vgood">Très bon état</SelectItem>
                      <SelectItem value="good">Bon état</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold font-headline">Prix et livraison</h2>
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix de vente (€)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    className="text-2xl font-bold"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">Les acheteurs paieront des frais de protection en plus.</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Label>Options de livraison</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded-xl hover:border-accent cursor-pointer">
                  <div>
                    <p className="font-bold">Mondial Relay / Colis Privé</p>
                    <p className="text-xs text-muted-foreground">Le plus populaire, point relais.</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl hover:border-accent cursor-pointer opacity-50">
                  <div>
                    <p className="font-bold">Remise en main propre</p>
                    <p className="text-xs text-muted-foreground">Rencontrez l'acheteur près de chez vous.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-8 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Button>
          ) : <div />}
          
          <Button 
            onClick={step === 3 ? () => toast({title: "C'est prêt !", description: "Votre article est en cours de publication."}) : nextStep} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 min-w-[140px]"
          >
            {step === 3 ? "Publier l'annonce" : "Continuer"}
            {step < 3 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}