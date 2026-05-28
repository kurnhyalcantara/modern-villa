'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { Pagination } from '@/components/pagination';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  basePath,
}: AdminPaginationProps) {
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
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [router, searchParams, basePath],
  );

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
