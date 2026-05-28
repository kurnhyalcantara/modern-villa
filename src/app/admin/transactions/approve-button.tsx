'use client';

import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface ApproveButtonProps {
  id: string;
  type: 'deposit' | 'withdrawal';
}

export function ApproveButton({ id, type }: ApproveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        type === 'deposit'
          ? `/api/admin/deposits/${id}/approve`
          : `/api/admin/withdrawals/${id}/approve`;

      const res = await fetch(endpoint, { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message ?? 'Approval failed');
        return;
      }

      toast.success(
        `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} approved`,
      );
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id, type, router]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleApprove}
      disabled={loading}
      className="h-7 text-xs"
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Check className="size-3" />
      )}
      Approve
    </Button>
  );
}
