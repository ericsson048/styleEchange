"use client";

import Link from "next/link";
import { Search, Heart, MessageCircle, User, Plus, LogOut, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CartBadge } from "@/components/layout/CartBadge";

export function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = (user as any)?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold text-xl group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:block">
            StyleÉchange
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input
            placeholder="Rechercher des articles..."
            className="pl-10 bg-muted/50 border-transparent focus-visible:bg-background transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-4">
          <Link href="/sell">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold cursor-pointer">
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Vendre</span>
            </Button>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <CurrencySelector className="w-24 h-8 text-xs hidden sm:flex" />
            <CartBadge />
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative group cursor-pointer">
                <Heart className="h-6 w-6 group-hover:text-red-500 transition-colors" />
                <span className="sr-only">Favoris</span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative cursor-pointer">
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">Messages</span>
              </Button>
            </Link>
            {user && <NotificationBell />}

            {status === "loading" ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer gap-2">
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer gap-2 text-accent">
                          <Shield className="h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer gap-2"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <User className="h-6 w-6" />
                  <span className="sr-only">Connexion</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
