import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';
import { getServerTranslation } from '@/lib/server-translation';

import { BookingTable } from './booking-table';

export const metadata: Metadata = { title: 'Bookings' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const [params, { t }] = await Promise.all([searchParams, getServerTranslation()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('admin.bookings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.bookings.subtitle')}
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton />}>
        <BookingTable searchParams={params} />
      </Suspense>
    </div>
  );
}
