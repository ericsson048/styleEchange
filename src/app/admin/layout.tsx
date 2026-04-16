import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Package, ShoppingBag, BarChart3, LogOut, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/reports", label: "Signalements", icon: Flag },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const pendingReports = await prisma.report.count({ where: { status: "PENDING" } });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold">
              A
            </div>
            <div>
              <p className="font-bold text-sm">Administration</p>
              <p className="text-xs text-muted-foreground">StyleÉchange</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium hover:bg-accent/10 hover:text-accent"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.href === "/admin/reports" && pendingReports > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {pendingReports}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Retour au site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
