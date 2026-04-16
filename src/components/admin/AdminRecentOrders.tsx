"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  PAID: { label: "Payé", variant: "default" },
  SHIPPED: { label: "Expédié", variant: "outline" },
  DELIVERED: { label: "Livré", variant: "default" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  REFUNDED: { label: "Remboursé", variant: "destructive" },
};

interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  productTitle: string;
  productImage: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

export function AdminRecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">Aucune commande pour l'instant.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: "secondary" as const };
        return (
          <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
              {order.productImage && (
                <Image src={order.productImage} alt={order.productTitle} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{order.productTitle}</p>
              <p className="text-xs text-muted-foreground">{order.buyerName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm">{order.amount.toFixed(2)} €</p>
              <Badge variant={statusInfo.variant} className="text-xs mt-1">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
