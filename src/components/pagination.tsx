'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="text-muted-foreground flex size-7 items-center justify-center text-sm"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => onPageChange(page as number)}
            className={cn(
              page === currentPage && 'bg-ocean hover:bg-ocean/90 text-white',
            )}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
