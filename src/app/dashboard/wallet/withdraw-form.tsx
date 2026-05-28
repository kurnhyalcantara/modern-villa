'use client';

import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface WithdrawFormProps {
  balance: number;
}

export function WithdrawForm({ balance }: WithdrawFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = Number(amount);

      if (!num || num <= 0) {
        toast.error('Enter a valid amount');
        return;
      }

      if (num > balance) {
        toast.error('Insufficient balance');
        return;
      }

      if (bankAccount.length < 5) {
        toast.error('Enter a valid bank account');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/finance/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: num, bankAccount }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Withdrawal failed');
          return;
        }

        toast.success(`$${num.toLocaleString()} withdrawal processed`);
        setAmount('');
        setBankAccount('');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [amount, bankAccount, balance, router],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpRight className="size-4" />
          Withdraw
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="withdraw-amount" className="text-sm font-medium">
              Amount ($)
            </label>
            <Input
              id="withdraw-amount"
              type="number"
              min="1"
              step="0.01"
              max={balance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bank-account" className="text-sm font-medium">
              Bank Account
            </label>
            <Input
              id="bank-account"
              type="text"
              placeholder="Enter bank account number"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={loading || !amount || !bankAccount}
            className="w-full"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Withdraw
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
