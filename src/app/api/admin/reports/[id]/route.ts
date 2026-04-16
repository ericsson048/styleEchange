import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  if (!["PENDING", "REVIEWED", "DISMISSED"].includes(status))
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });

  await prisma.report.update({ where: { id }, data: { status } });
  return NextResponse.json({ success: true });
}
