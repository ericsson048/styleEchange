"use client"

import Link from "next/link"
import { Search, Heart, MessageCircle, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()

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
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold">
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Vendre</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative group">
                <Heart className="h-6 w-6 group-hover:text-red-500 transition-colors" />
                <span className="sr-only">Favoris</span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative">
                <MessageCircle className="h-6 w-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background"></span>
                <span className="sr-only">Messages</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
                <span className="sr-only">Profil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}