import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <Ban className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold font-headline">Compte suspendu</h1>
        <p className="text-muted-foreground">
          Votre compte a été suspendu suite à une violation de nos conditions d'utilisation.
          Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="mailto:support@stylechange.bi">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Contacter le support
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">Se connecter avec un autre compte</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
