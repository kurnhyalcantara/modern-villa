import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';

import { BookingTable } from './booking-table';

export const metadata: Metadata = { title: 'Bookings' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Booking Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all bookings
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton />}>
        <BookingTable searchParams={params} />
      </Suspense>
    </div>
  );
}
