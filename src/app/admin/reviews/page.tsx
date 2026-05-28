import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';

import { ReviewTable } from './review-table';

export const metadata: Metadata = { title: 'Reviews' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and moderate user reviews
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton />}>
        <ReviewTable searchParams={params} />
      </Suspense>
    </div>
  );
}
