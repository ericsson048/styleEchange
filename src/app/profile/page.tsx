import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/profile");

  const { tab } = await searchParams;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/auth/login");

  const [dressing, orders, sales] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: user.id },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { buyerId: user.id },
      include: { product: { select: { title: true, imageUrl: true, imageUrls: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // Ventes : commandes où l'utilisateur est le vendeur
    prisma.order.findMany({
      where: { sellerId: user.id },
      include: {
        product: { select: { title: true, imageUrl: true, imageUrls: true } },
        buyer: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <ProfileClient
      defaultTab={tab ?? "dressing"}
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        location: user.location,
        rating: user.rating,
        reviewsCount: user.reviewsCount,
        createdAt: user.createdAt.toISOString(),
        role: user.role,
      }}
      dressing={dressing.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        size: p.size ?? "TU",
        brand: p.brand ?? "Sans marque",
        imageUrl: p.imageUrl ?? p.imageUrls[0] ?? "https://picsum.photos/seed/fallback/600/800",
        userName: p.owner.name,
        userImage: p.owner.avatarUrl ?? undefined,
      }))}
      orders={orders.map((o) => ({
        id: o.id,
        productTitle: o.product.title,
        productImage: o.product.imageUrl ?? o.product.imageUrls[0] ?? null,
        amount: Number(o.amount),
        protectionFee: Number(o.protectionFee),
        shippingFee: Number(o.shippingFee),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))}
      sales={sales.map((s) => ({
        id: s.id,
        productTitle: s.product.title,
        productImage: s.product.imageUrl ?? s.product.imageUrls[0] ?? null,
        buyerName: s.buyer?.name ?? "Acheteur",
        buyerAvatar: s.buyer?.avatarUrl ?? null,
        amount: Number(s.amount),
        protectionFee: Number(s.protectionFee),
        shippingFee: Number(s.shippingFee),
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
