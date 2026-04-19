import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const normalizedCategorySlug = category
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
  const size = searchParams.get("size") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 999_999_999);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const filters: any[] = [{ isActive: true }, { price: { gte: minPrice, lte: maxPrice } }];

  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (category && category !== "Tout") {
    filters.push({
      OR: [
        { categoryLegacy: { equals: category, mode: "insensitive" } },
        {
          category: {
            is: {
              OR: [
                { id: category },
                { slug: normalizedCategorySlug },
                { name: { equals: category, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  if (size) {
    filters.push({ size: { contains: size, mode: "insensitive" } });
  }

  if (condition) {
    filters.push({ condition });
  }

  const where: any = { AND: filters };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        owner: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      size: p.size ?? "TU",
      brand: p.brand ?? "Sans marque",
      category: p.category?.name ?? p.categoryLegacy ?? null,
      condition: p.condition,
      location: p.location,
      imageUrl: p.imageUrl ?? p.imageUrls[0] ?? "https://picsum.photos/seed/fallback/600/800",
      userName: p.owner.name,
      userImage: p.owner.avatarUrl ?? undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  });
}
