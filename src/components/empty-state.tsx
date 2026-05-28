import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-8" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm text-sm">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
