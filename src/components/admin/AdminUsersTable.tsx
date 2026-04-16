"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  _count: { products: number; orders: number };
}

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole === "ADMIN" ? "USER" : "ADMIN" }),
      });
      if (res.ok) {
        toast({ title: "Rôle mis à jour." });
        window.location.reload();
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="gap-1">
                    {user.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{user._count.products}</TableCell>
                <TableCell className="text-sm">{user._count.orders}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRole(user.id, user.role)}
                    disabled={loading === user.id}
                    className="text-xs"
                  >
                    {user.role === "ADMIN" ? "Révoquer admin" : "Promouvoir admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
