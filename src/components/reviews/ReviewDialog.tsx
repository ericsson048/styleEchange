"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/StarRating";
import { Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewDialogProps {
  targetId: string;
  targetName: string;
  existingRating?: number;
}

export function ReviewDialog({ targetId, targetName, existingRating }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingRating ?? 0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Sélectionnez une note", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, rating, comment }),
      });
      if (res.ok) {
        toast({ title: "Avis publié !", description: `Votre note pour ${targetName} a été enregistrée.` });
        setOpen(false);
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
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <Star className="h-4 w-4" />
          {existingRating ? "Modifier mon avis" : "Laisser un avis"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Noter {targetName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Votre note globale</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            <p className="text-sm font-medium text-accent">
              {rating === 1 && "Très mauvais"}
              {rating === 2 && "Mauvais"}
              {rating === 3 && "Correct"}
              {rating === 4 && "Bien"}
              {rating === 5 && "Excellent !"}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire (optionnel)</label>
            <Textarea
              placeholder="Décrivez votre expérience avec ce vendeur..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier l'avis"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
