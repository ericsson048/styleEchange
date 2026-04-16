import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { products: true, orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">{users.length} membres inscrits</p>
      </div>
      <AdminUsersTable
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
