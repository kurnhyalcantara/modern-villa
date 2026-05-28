'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { Pagination } from '@/components/pagination';

interface BookingPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function BookingPagination({
  currentPage,
  totalPages,
}: BookingPaginationProps) {
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
        router.push(`/dashboard/bookings?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
