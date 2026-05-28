'use client';

import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function DepositForm() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = Number(amount);
      if (!num || num <= 0) {
        toast.error('Enter a valid amount');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/finance/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: num }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Deposit failed');
          return;
        }

        toast.success(`$${num.toLocaleString()} deposited successfully`);
        setAmount('');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [amount, router],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="size-4" />
          Deposit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="deposit-amount" className="text-sm font-medium">
              Amount ($)
            </label>
            <Input
              id="deposit-amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !amount}
            className="bg-ocean hover:bg-ocean/90 w-full text-white"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Deposit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
