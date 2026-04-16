"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function BuyButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBuy = () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/checkout?productId=${productId}`);
      return;
    }
    router.push(`/checkout?productId=${productId}`);
  };

  return (
    <Button
      onClick={handleBuy}
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg font-bold cursor-pointer"
    >
      <ShoppingBag className="h-5 w-5 mr-2" />
      Acheter
    </Button>
  );
}
