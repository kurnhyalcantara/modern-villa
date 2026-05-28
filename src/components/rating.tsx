import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

const sizeClasses = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  count,
}: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30 fill-muted-foreground/30',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-muted-foreground text-sm">({count})</span>
      )}
    </div>
  );
}
