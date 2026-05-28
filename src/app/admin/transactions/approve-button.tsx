'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReviewButtonsProps {
  id: string;
  type: 'deposit' | 'withdrawal';
  allowComplete?: boolean;
}

export function ReviewButtons({ id, type, allowComplete = false }: ReviewButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | 'complete' | null>(null);
  const [showNote, setShowNote] = useState<'approve' | 'reject' | 'complete' | null>(null);
  const [note, setNote] = useState('');

  const handleAction = useCallback(
    async (action: 'approve' | 'reject' | 'complete') => {
      setLoading(action);
      try {
        const endpoint =
          type === 'deposit'
            ? `/api/admin/deposits/${id}/review`
            : `/api/admin/withdrawals/${id}/review`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, adminNote: note || undefined }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Action failed');
          return;
        }

        toast.success(
          `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} ${action === 'approve' ? 'approved' : action === 'complete' ? 'completed' : 'rejected'}`,
        );
        setShowNote(null);
        setNote('');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(null);
      }
    },
    [id, type, note, router],
  );

  if (showNote) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          className="h-7 w-40 text-xs"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAction(showNote); if (e.key === 'Escape') { setShowNote(null); setNote(''); } }}
          autoFocus
        />
        <Button
          size="sm"
          className="h-7 text-xs"
          variant={showNote === 'reject' ? 'destructive' : 'default'}
          onClick={() => handleAction(showNote)}
          disabled={!!loading}
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowNote(null); setNote(''); }}>
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNote('approve')}
        disabled={!!loading}
        className="h-7 text-xs text-green-700"
      >
        <Check className="size-3" />
        Approve
      </Button>
      {allowComplete && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNote('complete')}
          disabled={!!loading}
          className="h-7 text-xs text-blue-700"
        >
          Complete
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNote('reject')}
        disabled={!!loading}
        className="text-destructive h-7 text-xs"
      >
        <X className="size-3" />
        Reject
      </Button>
    </div>
  );
}

export function ApproveButton({ id, type }: { id: string; type: 'deposit' | 'withdrawal' }) {
  return <ReviewButtons id={id} type={type} />;
}
