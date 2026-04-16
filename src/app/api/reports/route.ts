import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  reason: z.enum(["FAKE", "INAPPROPRIATE", "SPAM", "COUNTERFEIT", "OTHER"]),
  details: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { productId, reason, details } = parsed.data;

  try {
    await prisma.report.upsert({
      where: { authorId_productId: { authorId: session.user.id, productId } },
      update: { reason, details: details ?? null, status: "PENDING" },
      create: { authorId: session.user.id, productId, reason, details: details ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REPORT POST]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
