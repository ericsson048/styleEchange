"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function CartBadge() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, [session?.user]);

  if (!session?.user) return null;

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative cursor-pointer">
        <ShoppingCart className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
            {count > 9 ? "9+" : count}
          </span>
        )}
        <span className="sr-only">Panier</span>
      </Button>
    </Link>
  );
}
