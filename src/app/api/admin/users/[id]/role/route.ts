import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ success: true });
}
