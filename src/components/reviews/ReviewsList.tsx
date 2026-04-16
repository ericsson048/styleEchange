import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/reviews/StarRating";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export async function ReviewsList({ targetId }: { targetId: string }) {
  const reviews = await prisma.review.findMany({
    where: { targetId },
    include: { authorUser: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Aucun avis pour l'instant.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-muted shrink-0">
            <img
              src={review.authorUser.avatarUrl ?? `https://picsum.photos/seed/${review.authorId}/100/100`}
              alt={review.authorUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">{review.authorUser.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(review.createdAt, "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <StarRating value={review.rating} readonly size="sm" />
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
