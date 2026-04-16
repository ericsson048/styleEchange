import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — met à jour lastSeenAt de l'utilisateur connecté
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
