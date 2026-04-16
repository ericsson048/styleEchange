"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REASONS = [
  { value: "FAKE", label: "Annonce frauduleuse / faux article" },
  { value: "COUNTERFEIT", label: "Contrefaçon / article copié" },
  { value: "INAPPROPRIATE", label: "Contenu inapproprié" },
  { value: "SPAM", label: "Spam / doublon" },
  { value: "OTHER", label: "Autre raison" },
];

export function ReportDialog({ productId, productTitle }: { productId: string; productTitle: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({ title: "Sélectionnez une raison", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reason, details }),
      });
      if (res.ok) {
        toast({ title: "Signalement envoyé", description: "Notre équipe va examiner cet article." });
        setOpen(false);
        setReason("");
        setDetails("");
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Flag className="h-4 w-4" />
          Signaler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler cet article</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 truncate">« {productTitle} »</p>

        <div className="space-y-5 py-1">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Raison du signalement *</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/40 cursor-pointer transition-colors">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="cursor-pointer text-sm font-normal">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Détails supplémentaires (optionnel)</Label>
            <Textarea
              placeholder="Décrivez le problème..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le signalement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
