"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  productId: string;
}

export function VoteButtons({ productId }: VoteButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [ups, setUps] = useState(0);
  const [downs, setDowns] = useState(0);
  const [myVote, setMyVote] = useState<"UP" | "DOWN" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/votes?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => { setUps(d.ups); setDowns(d.downs); setMyVote(d.myVote); })
      .catch(() => {});
  }, [productId]);

  const vote = async (value: "UP" | "DOWN") => {
    if (!session) { router.push(`/auth/login?callbackUrl=/product/${productId}`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, value }),
      });
      const data = await res.json();
      if (res.ok) {
        setUps(data.ups);
        setDowns(data.downs);
        setMyVote(value);
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => vote("UP")}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
          myVote === "UP"
            ? "bg-green-50 text-green-600 border-green-200"
            : "hover:bg-muted border-border text-muted-foreground"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{ups}</span>
      </button>
      <button
        onClick={() => vote("DOWN")}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
          myVote === "DOWN"
            ? "bg-red-50 text-red-500 border-red-200"
            : "hover:bg-muted border-border text-muted-foreground"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downs}</span>
      </button>
    </div>
  );
}
