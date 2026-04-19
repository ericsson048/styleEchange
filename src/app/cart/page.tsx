import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartClient } from "@/components/cart/CartClient";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/cart");

  const cart = await prisma.cart
    .findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: { include: { owner: { select: { name: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    .catch((error) => {
      console.error("[CART PAGE] Prisma error:", error);
      return null;
    });

  const items = (cart?.items ?? []).map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.product.title,
    price: Number(item.unitPrice),
    imageUrl: item.product.imageUrl ?? item.product.imageUrls[0] ?? null,
    ownerName: item.product.owner.name,
    isActive: item.product.isActive,
    size: item.product.size,
    condition: item.product.condition,
  }));

  return <CartClient items={items} />;
}
