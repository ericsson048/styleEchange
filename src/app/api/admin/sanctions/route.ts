import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  type: z.enum(["WARNING", "SUSPENSION", "RESTRICTION_SELL", "RESTRICTION_MESSAGE"]),
  reason: z.string().min(5),
  notes: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { userId, type, reason, notes, endsAt } = parsed.data;

  const sanction = await prisma.sanction.create({
    data: {
      userId,
      adminId: session.user.id!,
      type,
      reason,
      notes: notes ?? null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  const typeLabels: Record<string, string> = {
    WARNING: "avertissement",
    SUSPENSION: "suspension",
    RESTRICTION_SELL: "restriction de vente",
    RESTRICTION_MESSAGE: "restriction de messagerie",
  };

  await createNotification({
    userId,
    type: "SANCTION",
    title: `Sanction : ${typeLabels[type]}`,
    body: reason,
    link: "/profile",
  });

  return NextResponse.json(sanction, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const sanctions = await prisma.sanction.findMany({
    where: userId ? { userId } : {},
    include: {
      user: { select: { name: true, email: true } },
      admin: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sanctions);
}
