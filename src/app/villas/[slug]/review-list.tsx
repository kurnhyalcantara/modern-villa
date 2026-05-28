import { MessageSquare } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { Rating } from '@/components/rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { VillaReview } from '@/types/villa';

interface ReviewListProps {
  reviews: VillaReview[];
  rating: number;
  count: number;
}

export function ReviewList({ reviews, rating, count }: ReviewListProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Reviews
          {count > 0 && (
            <span className="text-muted-foreground ml-2 text-base font-normal">
              ({count})
            </span>
          )}
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <Rating value={rating} size="sm" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Be the first to review this villa after your stay."
        />
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: VillaReview }) {
  const initials = review.user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex gap-4">
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          src={review.user.avatar ?? undefined}
          alt={review.user.fullName}
        />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{review.user.fullName}</span>
          <span className="text-muted-foreground text-xs">{formattedDate}</span>
        </div>

        <Rating value={review.rating} size="sm" />

        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
}
