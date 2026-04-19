"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminCategory {
  id: string; name: string; slug: string;
  description: string | null; isActive: boolean;
  productsCount: number; createdAt: string;
}

export function AdminCategoriesClient({ categories: initial }: { categories: AdminCategory[] }) {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", description: "" }); setOpen(true); };
  const openEdit = (cat: AdminCategory) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "" }); setOpen(true); };

  const handleSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const save = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories" + (editing ? `/${editing.id}` : ""), {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: editing ? "Catégorie mise à jour." : "Catégorie créée." });
        setOpen(false);
        window.location.reload();
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !current } : c));
      toast({ title: !current ? "Catégorie activée." : "Catégorie désactivée." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Créer"} une catégorie</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: handleSlug(e.target.value) })} placeholder="ex: Femme" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex: femme" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <Button onClick={save} disabled={loading || !form.name} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                {editing ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                <TableCell className="text-sm">{cat.productsCount}</TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? "default" : "secondary"}>{cat.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => openEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => toggleActive(cat.id, cat.isActive)}>
                      {cat.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
