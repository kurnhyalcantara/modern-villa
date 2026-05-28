'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'pay' | 'cancel' | null>(null);

  const handlePay = useCallback(async () => {
    setLoading('pay');
    try {
      const res = await fetch('/api/bookings/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'WALLET',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? 'Payment failed');
        return;
      }

      toast.success('Payment successful! Booking confirmed.');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  }, [bookingId, router]);

  const handleCancel = useCallback(async () => {
    setLoading('cancel');
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? 'Cancellation failed');
        return;
      }

      toast.success('Booking cancelled successfully.');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  }, [bookingId, router]);

  if (status === 'CANCELLED' || status === 'EXPIRED') {
    return null;
  }

  return (
    <div className="flex shrink-0 gap-2">
      {status === 'PENDING' && (
        <Button
          size="sm"
          className="bg-ocean hover:bg-ocean/90 text-white"
          onClick={handlePay}
          disabled={loading !== null}
        >
          {loading === 'pay' && <Loader2 className="size-3.5 animate-spin" />}
          Pay Now
        </Button>
      )}

      {(status === 'PENDING' || status === 'PAID') && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading !== null}
        >
          {loading === 'cancel' && (
            <Loader2 className="size-3.5 animate-spin" />
          )}
          Cancel
        </Button>
      )}
    </div>
  );
}
