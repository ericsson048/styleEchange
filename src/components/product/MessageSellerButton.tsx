"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  sellerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
}

export function MessageSellerButton({ sellerId, sellerName, productId, productTitle }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Bonjour, je suis intéressé(e) par votre article "${productTitle}". Est-il toujours disponible ?`);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/product/${productId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, productId, initialMessage: message }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      setOpen(false);
      router.push(`/messages?thread=${data.threadId}`);
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 text-base gap-2 cursor-pointer">
          <MessageCircle className="h-5 w-5" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter {sellerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message..."
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          <Button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
