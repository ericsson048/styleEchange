import { prisma } from "@/lib/prisma";
import { AdminReportsTable } from "@/components/admin/AdminReportsTable";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, email: true } },
      product: { select: { id: true, title: true, imageUrl: true, isActive: true } },
    },
  });

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Signalements</h1>
        <p className="text-muted-foreground mt-1">
          {reports.length} signalement{reports.length > 1 ? "s" : ""} —{" "}
          <span className="text-destructive font-medium">{pendingCount} en attente</span>
        </p>
      </div>
      <AdminReportsTable
        reports={reports.map((r) => ({
          id: r.id,
          authorName: r.author.name,
          authorEmail: r.author.email,
          productId: r.product.id,
          productTitle: r.product.title,
          productImage: r.product.imageUrl,
          productIsActive: r.product.isActive,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
