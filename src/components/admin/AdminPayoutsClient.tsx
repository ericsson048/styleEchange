"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  APPROVED: { label: "Approuvé", variant: "outline" },
  PAID: { label: "Versé", variant: "default" },
  FAILED: { label: "Échoué", variant: "destructive" },
};

interface Payout {
  id: string; sellerName: string; sellerEmail: string; productTitle: string;
  orderId: string; grossAmount: number; platformFee: number;
  shippingFee: number; netAmount: number; status: string;
  paidAt: string | null; createdAt: string;
}

export function AdminPayoutsClient({ payouts: initial }: { payouts: Payout[] }) {
  const [payouts, setPayouts] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status, paidAt: status === "PAID" ? new Date().toISOString() : p.paidAt } : p));
        toast({ title: "Statut mis à jour." });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");

  return (
    <div className="space-y-4">
      {pendingPayouts.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => pendingPayouts.forEach((p) => updateStatus(p.id, "PAID"))}
            className="bg-green-600 text-white hover:bg-green-700 gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Tout approuver et verser ({pendingPayouts.length})
          </Button>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Vendeur</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Brut</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Net vendeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun reversement.</TableCell></TableRow>
            )}
            {payouts.map((p) => {
              const s = STATUS_STYLES[p.status] ?? { label: p.status, variant: "secondary" as const };
              return (
                <TableRow key={p.id} className="hover:bg-muted/20">
                  <TableCell>
                    <p className="text-sm font-medium">{p.sellerName}</p>
                    <p className="text-xs text-muted-foreground">{p.sellerEmail}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-[160px] truncate">{p.productTitle}</TableCell>
                  <TableCell className="text-sm">{p.grossAmount.toLocaleString("fr-BI")} BIF</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.platformFee.toLocaleString("fr-BI")} BIF</TableCell>
                  <TableCell className="font-bold text-sm text-green-600">{p.netAmount.toLocaleString("fr-BI")} BIF</TableCell>
                  <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.paidAt ? format(new Date(p.paidAt), "d MMM yyyy", { locale: fr }) : format(new Date(p.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status !== "PAID" && p.status !== "FAILED" && (
                      <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)} disabled={loading === p.id}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          {loading === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_STYLES).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
