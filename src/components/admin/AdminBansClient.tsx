"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Ban {
  id: string; userId: string; userName: string; userEmail: string;
  isBanned: boolean; adminName: string; reason: string;
  isPermanent: boolean; expiresAt: string | null; createdAt: string;
}
interface User { id: string; name: string; email: string; isBanned: boolean; }

export function AdminBansClient({ bans: initial, users }: { bans: Ban[]; users: User[] }) {
  const [bans, setBans] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", reason: "", isPermanent: false, expiresAt: "" });
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const save = async () => {
    if (!form.userId || !form.reason) return;
    setLoading("create");
    try {
      const res = await fetch("/api/admin/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "Utilisateur banni." });
        setOpen(false);
        window.location.reload();
      } else {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const unban = async (userId: string) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/bans?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setBans((prev) => prev.map((b) => b.userId === userId ? { ...b, isBanned: false } : b));
        toast({ title: "Bannissement levé." });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Bannir un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Bannir un utilisateur</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Utilisateur *</Label>
                <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un utilisateur" /></SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => !u.isBanned).map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Raison *</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} placeholder="Motif du bannissement..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isPermanent} onCheckedChange={(v) => setForm({ ...form, isPermanent: v })} />
                <Label>Bannissement permanent</Label>
              </div>
              {!form.isPermanent && (
                <div className="space-y-2">
                  <Label>Date d'expiration</Label>
                  <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
              )}
              <Button onClick={save} disabled={loading === "create" || !form.userId || !form.reason}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
                Confirmer le bannissement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bans.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun bannissement.</TableCell></TableRow>
            )}
            {bans.map((b) => (
              <TableRow key={b.id} className="hover:bg-muted/20">
                <TableCell>
                  <p className="text-sm font-medium">{b.userName}</p>
                  <p className="text-xs text-muted-foreground">{b.userEmail}</p>
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">{b.reason}</TableCell>
                <TableCell>
                  <Badge variant={b.isPermanent ? "destructive" : "secondary"}>
                    {b.isPermanent ? "Permanent" : "Temporaire"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {b.expiresAt ? format(new Date(b.expiresAt), "d MMM yyyy", { locale: fr }) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={b.isBanned ? "destructive" : "outline"}>
                    {b.isBanned ? "Banni" : "Levé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {b.isBanned && (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-green-600 hover:text-green-700 cursor-pointer"
                      onClick={() => unban(b.userId)} disabled={loading === b.userId}>
                      <UserCheck className="h-4 w-4" /> Lever
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
