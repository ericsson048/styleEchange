import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  return NextResponse.json({ isActive: updated.isActive });
}
