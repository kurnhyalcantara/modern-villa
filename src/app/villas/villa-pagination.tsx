'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { Pagination } from '@/components/pagination';

interface VillaPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function VillaPagination({
  currentPage,
  totalPages,
}: VillaPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      startTransition(() => {
        router.push(`/villas?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div className="pt-6">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
