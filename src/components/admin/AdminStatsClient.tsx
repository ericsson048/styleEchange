"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ["#25C1B1", "#292E36", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

interface Props {
  orders: { createdAt: string; amount: number; status: string }[];
  users: { createdAt: string }[];
  productsByCategory: { category: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
}

const STATUS_FR: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  SHIPPED: "Expédié",
  DELIVERED: "Livré",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

export function AdminStatsClient({ orders, users, productsByCategory, ordersByStatus }: Props) {
  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; revenue: number; orders: number; users: number }>();

    orders.forEach((o) => {
      const key = format(startOfMonth(parseISO(o.createdAt)), "MMM yyyy", { locale: fr });
      const existing = map.get(key) ?? { month: key, revenue: 0, orders: 0, users: 0 };
      existing.orders += 1;
      if (o.status === "PAID" || o.status === "DELIVERED") existing.revenue += o.amount;
      map.set(key, existing);
    });

    users.forEach((u) => {
      const key = format(startOfMonth(parseISO(u.createdAt)), "MMM yyyy", { locale: fr });
      const existing = map.get(key) ?? { month: key, revenue: 0, orders: 0, users: 0 };
      existing.users += 1;
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [orders, users]);

  const statusData = ordersByStatus.map((o) => ({
    name: STATUS_FR[o.status] ?? o.status,
    value: o.count,
  }));

  const categoryData = productsByCategory
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Revenue & Orders over time */}
      <Card className="border-none shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Revenus & Commandes par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenus (€)" stroke="#25C1B1" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Commandes" stroke="#292E36" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Products by category */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Produits par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
              <Bar dataKey="count" name="Produits" fill="#25C1B1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders by status */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Commandes par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* New users over time */}
      <Card className="border-none shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Nouveaux utilisateurs par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
              <Bar dataKey="users" name="Nouveaux membres" fill="#292E36" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
