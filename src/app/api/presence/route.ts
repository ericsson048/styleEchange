import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — met à jour lastSeenAt de l'utilisateur connecté
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeenAt: new Date() },
    });
  } catch (error) {
    console.error("[PRESENCE POST] Prisma error:", error);
    return NextResponse.json({ ok: false, degraded: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
