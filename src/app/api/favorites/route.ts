import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ productId: z.string() });

// POST — ajouter aux favoris
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  try {
    await prisma.favorite.create({
      data: { userId: session.user.id, productId: parsed.data.productId },
    });
    return NextResponse.json({ favorited: true });
  } catch {
    // Déjà en favori — on ignore
    return NextResponse.json({ favorited: true });
  }
}

// DELETE — retirer des favoris
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId)
    return NextResponse.json({ error: "productId requis." }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, productId },
  });

  return NextResponse.json({ favorited: false });
}
