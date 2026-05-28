'use client';

import { ArrowUpRight, Loader2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useWithdrawGatewayEnabled,
  useWithdrawManualEnabled,
} from '@/hooks/use-feature-flags';
import { formatRupiah } from '@/lib/currency';
import { useTranslation } from '@/hooks/use-translation';

interface WithdrawFormProps {
  balance: number;
}

export function WithdrawForm({ balance }: WithdrawFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);

  const manualEnabled = useWithdrawManualEnabled();
  const gatewayEnabled = useWithdrawGatewayEnabled();
  const hasAnyMode = manualEnabled || gatewayEnabled;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = Number(amount);

      if (!num || num <= 0) {
        toast.error(t('toast.enter_valid_amount'));
        return;
      }
      if (num > balance) {
        toast.error(t('toast.insufficient_balance'));
        return;
      }
      if (bankAccount.length < 5) {
        toast.error(t('toast.invalid_bank_account'));
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/finance/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: num, bankAccount, bankName: bankName || undefined }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? t('toast.withdrawal_failed'));
          return;
        }

        toast.success(t('toast.withdrawal_submitted', { amount: formatRupiah(num) }));
        setAmount('');
        setBankAccount('');
        setBankName('');
        router.refresh();
      } catch {
        toast.error(t('toast.something_wrong'));
      } finally {
        setLoading(false);
      }
    },
    [amount, bankAccount, bankName, balance, router, t],
  );

  const handleGatewayWithdraw = useCallback(() => {
    toast.info(t('toast.gateway_coming_soon'));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpRight className="size-4" />
          {t('wallet.withdraw')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyMode ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('wallet.withdrawals_unavailable')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="withdraw-amount" className="text-sm font-medium">
                {t('wallet.amount')}
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
            {manualEnabled && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="bank-name" className="text-sm font-medium">
                    {t('wallet.bank_name')}
                  </label>
                  <Input
                    id="bank-name"
                    type="text"
                    placeholder="e.g. BCA, Mandiri"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="bank-account" className="text-sm font-medium">
                    {t('wallet.account_number')}
                  </label>
                  <Input
                    id="bank-account"
                    type="text"
                    placeholder="Enter account number"
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
                  {t('wallet.request_withdrawal')}
                </Button>
              </>
            )}
            {gatewayEnabled && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading || !amount}
                className="w-full"
                onClick={handleGatewayWithdraw}
              >
                <Zap className="size-3.5" />
                {t('wallet.withdraw_via_gateway')}
              </Button>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
