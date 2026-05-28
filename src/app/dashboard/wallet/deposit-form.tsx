'use client';

import { CreditCard, Loader2, Plus, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useDepositGatewayEnabled,
  useDepositManualEnabled,
} from '@/hooks/use-feature-flags';
import { useTranslation } from '@/hooks/use-translation';

export function DepositForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const manualEnabled = useDepositManualEnabled();
  const gatewayEnabled = useDepositGatewayEnabled();
  const hasAnyMode = manualEnabled || gatewayEnabled;

  const handleManualDeposit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = Number(amount);
      if (!num || num <= 0) {
        toast.error(t('toast.enter_valid_amount'));
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
          toast.error(data.message ?? t('toast.deposit_failed'));
          return;
        }

        toast.success(t('toast.deposit_created'));
        router.push(`/dashboard/deposit/${data.data.id}`);
      } catch {
        toast.error(t('toast.something_wrong'));
      } finally {
        setLoading(false);
      }
    },
    [amount, router, t],
  );

  const handleGatewayDeposit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = Number(amount);
      if (!num || num <= 0) {
        toast.error(t('toast.enter_valid_amount'));
        return;
      }
      toast.info(t('toast.gateway_coming_soon'));
    },
    [amount],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="size-4" />
          {t('wallet.deposit')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyMode ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('wallet.deposits_unavailable')}
          </p>
        ) : (
          <form
            onSubmit={manualEnabled ? handleManualDeposit : handleGatewayDeposit}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <label htmlFor="deposit-amount" className="text-sm font-medium">
                {t('wallet.amount')}
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
            {manualEnabled && (
              <Button
                type="submit"
                size="sm"
                disabled={loading || !amount}
                className="bg-ocean hover:bg-ocean/90 w-full text-white"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CreditCard className="size-3.5" />
                )}
                {t('wallet.deposit_transfer')}
              </Button>
            )}
            {gatewayEnabled && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading || !amount}
                className="w-full"
                onClick={handleGatewayDeposit}
              >
                <Zap className="size-3.5" />
                {t('wallet.pay_with_gateway')}
              </Button>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
