import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  reason: z.string().min(5),
  isPermanent: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { userId, reason, isPermanent, expiresAt } = parsed.data;

  const [ban] = await prisma.$transaction([
    prisma.ban.create({
      data: {
        userId,
        adminId: session.user.id!,
        reason,
        isPermanent,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    }),
    prisma.user.update({ where: { id: userId }, data: { isBanned: true } }),
  ]);

  await createNotification({
    userId,
    type: "BAN",
    title: isPermanent ? "Compte banni définitivement" : "Compte suspendu temporairement",
    body: reason,
    link: "/",
  });

  return NextResponse.json(ban, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId requis." }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });

  return NextResponse.json({ success: true });
}
