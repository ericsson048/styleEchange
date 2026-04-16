"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EyeOff, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const REASON_LABELS: Record<string, string> = {
  FAKE: "Annonce frauduleuse",
  COUNTERFEIT: "Contrefaçon",
  INAPPROPRIATE: "Contenu inapproprié",
  SPAM: "Spam / doublon",
  OTHER: "Autre",
};

const STATUS_STYLES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "destructive" },
  REVIEWED: { label: "Traité", variant: "default" },
  DISMISSED: { label: "Ignoré", variant: "secondary" },
};

interface AdminReport {
  id: string;
  authorName: string;
  authorEmail: string;
  productId: string;
  productTitle: string;
  productImage: string | null;
  productIsActive: boolean;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export function AdminReportsTable({ reports: initial }: { reports: AdminReport[] }) {
  const [reports, setReports] = useState(initial);
  const [productStates, setProductStates] = useState<Record<string, boolean>>(
    Object.fromEntries(initial.map((r) => [r.productId, r.productIsActive]))
  );
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const updateStatus = async (reportId: string, status: string) => {
    setLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
        toast({ title: "Statut mis à jour." });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const toggleProduct = async (productId: string) => {
    setLoading("p_" + productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, { method: "PATCH" });
      if (res.ok) {
        const { isActive } = await res.json();
        setProductStates((prev) => ({ ...prev, [productId]: isActive }));
        toast({ title: isActive ? "Article réactivé" : "Article désactivé" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Article signalé</TableHead>
            <TableHead>Signalé par</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Détails</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const isActive = productStates[report.productId] ?? report.productIsActive;
            const statusInfo = STATUS_STYLES[report.status] ?? { label: report.status, variant: "secondary" as const };
            return (
              <TableRow
                key={report.id}
                className={cn("hover:bg-muted/20", report.status === "PENDING" && "bg-destructive/5")}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      {report.productImage && (
                        <Image src={report.productImage} alt={report.productTitle} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm max-w-[140px] truncate">{report.productTitle}</p>
                      <Badge variant={isActive ? "outline" : "secondary"} className="text-xs mt-0.5">
                        {isActive ? "Actif" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{report.authorName}</p>
                  <p className="text-xs text-muted-foreground">{report.authorEmail}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[160px]">
                  <p className="text-xs text-muted-foreground truncate">{report.details ?? "—"}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <Select
                    value={report.status}
                    onValueChange={(val) => updateStatus(report.id, val)}
                    disabled={loading === report.id}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_STYLES).map(([key, val]) => (
                        <SelectItem key={key} value={key} className="text-xs">{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/product/${report.productId}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir l'article">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        isActive
                          ? "text-muted-foreground hover:text-orange-500 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      )}
                      onClick={() => toggleProduct(report.productId)}
                      disabled={loading === "p_" + report.productId}
                      title={isActive ? "Désactiver l'article" : "Réactiver l'article"}
                    >
                      {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {reports.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                Aucun signalement pour l'instant.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
