import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  category: z.string().min(1),
  description: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().positive(),
  location: z.string().optional(),
  // Tableau de data URLs base64 (max 6 images)
  images: z.array(z.string()).max(6).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, category, description, brand, condition, size, price, location, images } = parsed.data;

  // Image principale : première image uploadée ou placeholder
  const imgSeed = Math.random().toString(36).slice(2, 8);
  const fallbackUrl = `https://picsum.photos/seed/${imgSeed}/600/800`;

  const imageUrl = images && images.length > 0 ? images[0] : fallbackUrl;
  const imageUrls = images && images.length > 0 ? images : [];

  try {
    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        title,
        category,
        description: description || null,
        brand: brand || null,
        condition: condition || null,
        size: size || null,
        price,
        location: location || null,
        ownerId: session.user.id,
        imageUrl,
        imageUrls,
      },
    });

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS POST] Prisma error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du produit." }, { status: 500 });
  }
}
