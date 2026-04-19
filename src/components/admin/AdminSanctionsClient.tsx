"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  WARNING: { label: "Avertissement", color: "bg-yellow-100 text-yellow-800" },
  SUSPENSION: { label: "Suspension", color: "bg-orange-100 text-orange-800" },
  RESTRICTION_SELL: { label: "Restriction vente", color: "bg-red-100 text-red-800" },
  RESTRICTION_MESSAGE: { label: "Restriction message", color: "bg-purple-100 text-purple-800" },
};

interface Sanction {
  id: string; userName: string; userEmail: string; adminName: string;
  type: string; reason: string; notes: string | null;
  startsAt: string; endsAt: string | null; createdAt: string;
}

interface User { id: string; name: string; email: string; isBanned: boolean; }

export function AdminSanctionsClient({ sanctions, users }: { sanctions: Sanction[]; users: User[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", type: "WARNING", reason: "", notes: "", endsAt: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    if (!form.userId || !form.reason) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sanctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "Sanction appliquée." });
        setOpen(false);
        window.location.reload();
      } else {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Nouvelle sanction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Appliquer une sanction</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Utilisateur *</Label>
                <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un utilisateur" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Raison *</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} placeholder="Motif de la sanction..." />
              </div>
              <div className="space-y-2">
                <Label>Notes internes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes pour l'équipe..." />
              </div>
              <div className="space-y-2">
                <Label>Date de fin (optionnel)</Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              </div>
              <Button onClick={save} disabled={loading || !form.userId || !form.reason} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                Appliquer la sanction
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
              <TableHead>Type</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sanctions.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune sanction.</TableCell></TableRow>
            )}
            {sanctions.map((s) => {
              const t = TYPE_LABELS[s.type] ?? { label: s.type, color: "" };
              return (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell>
                    <p className="text-sm font-medium">{s.userName}</p>
                    <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                  </TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${t.color}`}>{t.label}</span></TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{s.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.adminName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(s.createdAt), "d MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.endsAt ? format(new Date(s.endsAt), "d MMM yyyy", { locale: fr }) : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
