import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  value: z.enum(["UP", "DOWN"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { productId, value } = parsed.data;

  // Upsert — un seul vote par user/produit
  await prisma.vote.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId, value },
    update: { value },
  });

  const [ups, downs] = await Promise.all([
    prisma.vote.count({ where: { productId, value: "UP" } }),
    prisma.vote.count({ where: { productId, value: "DOWN" } }),
  ]);

  return NextResponse.json({ ups, downs });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId requis." }, { status: 400 });

  const session = await auth();

  const [ups, downs, myVote] = await Promise.all([
    prisma.vote.count({ where: { productId, value: "UP" } }),
    prisma.vote.count({ where: { productId, value: "DOWN" } }),
    session?.user?.id
      ? prisma.vote.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } })
      : null,
  ]);

  return NextResponse.json({ ups, downs, myVote: myVote?.value ?? null });
}
