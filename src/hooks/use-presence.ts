"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const INTERVAL_MS = 30_000; // toutes les 30 secondes

export function usePresence() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const ping = () => fetch("/api/presence", { method: "POST" });

    // Ping immédiat à l'arrivée
    ping();

    const interval = setInterval(ping, INTERVAL_MS);

    // Ping aussi quand l'onglet redevient visible
    const onVisible = () => { if (document.visibilityState === "visible") ping(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session?.user]);
}
