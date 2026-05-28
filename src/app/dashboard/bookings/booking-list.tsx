import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BOOKING_STATUS_VARIANT } from '@/constants/booking';
import { getCurrentUser } from '@/lib/auth';
import { bookingService } from '@/services/booking.service';

import { BookingActions } from './booking-actions';
import { BookingPagination } from './booking-pagination';

interface BookingListProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function BookingList({ searchParams }: BookingListProps) {
  const user = await getCurrentUser();

  const page = Number(searchParams.page) || 1;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const { bookings, total } = await bookingService.getByUserId(user.id, {
    page,
    limit: 10,
    status,
  });

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No bookings yet"
        description="Start exploring villas and book your next getaway."
      >
        <Link
          href="/villas"
          className="text-ocean text-sm font-medium hover:underline"
        >
          Browse villas →
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">
                    {booking.villa.title}
                  </h3>
                  <Badge
                    variant={
                      BOOKING_STATUS_VARIANT[booking.status] ?? 'secondary'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {booking.villa.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {new Date(booking.checkIn).toLocaleDateString()} —{' '}
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-ocean text-sm font-semibold">
                  ${Number(booking.totalPrice).toLocaleString()}
                </p>
              </div>

              <BookingActions bookingId={booking.id} status={booking.status} />
            </CardContent>
          </Card>
        ))}
      </div>

      <BookingPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
      />
    </div>
  );
}
