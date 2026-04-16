import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/checkout");

  const { productId } = await searchParams;
  if (!productId) redirect("/");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { owner: { select: { name: true, avatarUrl: true } } },
  });

  if (!product) redirect("/");

  // Empêcher d'acheter son propre article
  if (product.ownerId === session.user.id) redirect(`/product/${productId}`);

  return (
    <CheckoutClient
      product={{
        id: product.id,
        title: product.title,
        price: Number(product.price),
        imageUrl: product.imageUrl ?? product.imageUrls[0] ?? null,
        size: product.size,
        condition: product.condition,
        ownerName: product.owner.name,
      }}
    />
  );
}
