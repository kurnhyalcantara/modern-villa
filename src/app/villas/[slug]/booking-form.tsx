'use client';

import { CalendarDays, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/currency';
import { useTranslation } from '@/hooks/use-translation';

interface BookingFormProps {
  villaId: string;
  pricePerNight: number;
  maxGuests: number;
}

export function BookingForm({
  villaId,
  pricePerNight,
  maxGuests,
}: BookingFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = nights * pricePerNight;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!checkIn || !checkOut) {
        toast.error(t('toast.select_dates'));
        return;
      }

      if (nights <= 0) {
        toast.error(t('toast.checkout_after_checkin'));
        return;
      }

      const guestCount = Number(guests);
      if (guestCount < 1 || guestCount > maxGuests) {
        toast.error(t('toast.guests_range', { max: maxGuests }));
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            villaId,
            checkIn: new Date(checkIn).toISOString(),
            checkOut: new Date(checkOut).toISOString(),
            guests: guestCount,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? t('toast.booking_failed'));
          return;
        }

        toast.success(t('toast.booking_created'));
        router.push('/dashboard/bookings');
      } catch {
        toast.error(t('toast.something_wrong'));
      } finally {
        setLoading(false);
      }
    },
    [villaId, checkIn, checkOut, guests, nights, maxGuests, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="check-in"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <CalendarDays className="size-3.5" />
            {t('booking.checkin')}
          </label>
          <Input
            id="check-in"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) setCheckOut('');
            }}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="check-out"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <CalendarDays className="size-3.5" />
            {t('booking.checkout')}
          </label>
          <Input
            id="check-out"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={loading || !checkIn}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="guests"
          className="flex items-center gap-1 text-sm font-medium"
        >
          <Users className="size-3.5" />
          {t('booking.guests')}
        </label>
        <Input
          id="guests"
          type="number"
          min="1"
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          disabled={loading}
        />
        <p className="text-muted-foreground text-xs">
          {t('booking.max_guests', { count: maxGuests })}
        </p>
      </div>

      {nights > 0 && (
        <div className="bg-muted/50 rounded-lg border p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {formatRupiah(pricePerNight)} × {nights}{' '}
              {nights === 1 ? t('booking.night') : t('booking.nights')}
            </span>
            <span className="font-semibold">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={loading || nights <= 0}
        className="bg-ocean hover:bg-ocean/90 text-ocean-foreground w-full"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {nights > 0
          ? t('booking.book_button', { total: formatRupiah(totalPrice) })
          : t('booking.select_dates')}
      </Button>
    </form>
  );
}
