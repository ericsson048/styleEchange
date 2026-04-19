import { prisma } from "@/lib/prisma";
import { AdminBansClient } from "@/components/admin/AdminBansClient";

export default async function AdminBansPage() {
  const [bans, users] = await Promise.all([
    prisma.ban.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, isBanned: true } },
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
        <h1 className="text-3xl font-bold font-headline">Bannissements</h1>
        <p className="text-muted-foreground mt-1">
          {bans.length} bannissement{bans.length > 1 ? "s" : ""} —{" "}
          <span className="text-destructive font-medium">{users.filter((u) => u.isBanned).length} compte{users.filter((u) => u.isBanned).length > 1 ? "s" : ""} banni{users.filter((u) => u.isBanned).length > 1 ? "s" : ""}</span>
        </p>
      </div>
      <AdminBansClient
        bans={bans.map((b) => ({
          id: b.id, userName: b.user.name, userEmail: b.user.email,
          isBanned: b.user.isBanned, adminName: b.admin.name,
          reason: b.reason, isPermanent: b.isPermanent,
          expiresAt: b.expiresAt?.toISOString() ?? null,
          createdAt: b.createdAt.toISOString(), userId: b.userId,
        }))}
        users={users}
      />
    </div>
  );
}
