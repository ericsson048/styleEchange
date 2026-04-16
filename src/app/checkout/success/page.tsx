import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, MessageCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-lg text-center">
        <CardContent className="pt-12 pb-10 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-headline">Paiement confirmé !</h1>
            <p className="text-muted-foreground">
              Votre commande a été passée avec succès. Le vendeur a été notifié et prépare votre colis.
            </p>
          </div>

          <div className="bg-muted/40 rounded-xl p-4 text-sm text-left space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4 text-accent" />
              <span>Expédition sous 2-3 jours ouvrés</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>Contactez le vendeur via la messagerie</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/profile">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Voir mes commandes
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
