"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { usePresence } from "@/hooks/use-presence";

function PresenceTracker() {
  usePresence();
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <PresenceTracker />
      {children}
    </NextAuthSessionProvider>
  );
}
