import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { BookingList } from './booking-list';

export const metadata: Metadata = {
  title: 'My Bookings',
};

interface BookingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your villa bookings
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        }
      >
        <BookingList searchParams={params} />
      </Suspense>
    </div>
  );
}
