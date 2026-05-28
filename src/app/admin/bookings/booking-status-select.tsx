'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BookingStatusSelectProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingStatusSelect({
  bookingId,
  currentStatus,
}: BookingStatusSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    async (value: string | null) => {
      if (!value || value === currentStatus) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: value }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message ?? 'Update failed');
          return;
        }
        toast.success('Status updated');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [bookingId, currentStatus, router],
  );

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="h-8 w-28 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
        <SelectItem value="EXPIRED">Expired</SelectItem>
      </SelectContent>
    </Select>
  );
}
