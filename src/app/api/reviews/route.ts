import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  targetId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { targetId, rating, comment } = parsed.data;

  if (targetId === session.user.id)
    return NextResponse.json({ error: "Vous ne pouvez pas vous noter vous-même." }, { status: 400 });

  try {
    // Upsert : un seul avis par paire auteur/cible
    await prisma.review.upsert({
      where: { authorId_targetId: { authorId: session.user.id, targetId } },
      update: { rating, comment: comment ?? null },
      create: { authorId: session.user.id, targetId, rating, comment: comment ?? null },
    });

    // Recalcule la moyenne et le nombre d'avis du vendeur
    const agg = await prisma.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: targetId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewsCount: agg._count.rating,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REVIEW POST]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
