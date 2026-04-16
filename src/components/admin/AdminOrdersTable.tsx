"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  PAID: { label: "Payé", variant: "default" },
  SHIPPED: { label: "Expédié", variant: "outline" },
  DELIVERED: { label: "Livré", variant: "default" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  REFUNDED: { label: "Remboursé", variant: "destructive" },
};

interface AdminOrder {
  id: string;
  buyerName: string;
  buyerEmail: string;
  productTitle: string;
  productImage: string | null;
  amount: number;
  protectionFee: number;
  shippingFee: number;
  status: string;
  shippingMethod: string | null;
  stripePaymentId: string | null;
  createdAt: string;
}

export function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: string) => {
    setLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast({ title: "Statut mis à jour." });
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
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Commande</TableHead>
              <TableHead>Acheteur</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Livraison</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Changer statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => {
              const total = order.amount + order.protectionFee + order.shippingFee;
              const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: "secondary" as const };
              return (
                <TableRow key={order.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        {order.productImage && (
                          <Image src={order.productImage} alt={order.productTitle} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm max-w-[160px] truncate">{order.productTitle}</p>
                        <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{order.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                  </TableCell>
                  <TableCell className="font-bold text-sm">{total.toFixed(2)} €</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.shippingMethod === "home" ? "Domicile" : "Point relais"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus(order.id, val)}
                      disabled={loading === order.id}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <SelectItem key={key} value={key} className="text-xs">{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
