import { prisma } from "@/lib/prisma";
import { AdminSanctionsClient } from "@/components/admin/AdminSanctionsClient";

export default async function AdminSanctionsPage() {
  const [sanctions, users] = await Promise.all([
    prisma.sanction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        admin: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true, isBanned: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Sanctions</h1>
        <p className="text-muted-foreground mt-1">{sanctions.length} sanctions enregistrées</p>
      </div>
      <AdminSanctionsClient
        sanctions={sanctions.map((s) => ({
          id: s.id, userName: s.user.name, userEmail: s.user.email,
          adminName: s.admin.name, type: s.type, reason: s.reason,
          notes: s.notes, startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString(),
        }))}
        users={users}
      />
    </div>
  );
}
