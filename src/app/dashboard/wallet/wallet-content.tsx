import { Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/auth';
import { financeService } from '@/services/finance.service';

import { DepositForm } from './deposit-form';
import { WithdrawForm } from './withdraw-form';

export async function WalletContent() {
  const user = await getCurrentUser();
  const { transactions } = await financeService.getTransactionHistory(user.id, {
    page: 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="bg-ocean/10 flex size-10 items-center justify-center rounded-full">
            <Wallet className="text-ocean size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <p className="text-ocean text-3xl font-bold">
              ${Number(user.balance).toLocaleString()}
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DepositForm />
        <WithdrawForm balance={Number(user.balance)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={tx.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          tx.type === 'deposit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'deposit' ? '+' : '-'}$
                        {tx.amount.toLocaleString()}
                      </span>
                      <Badge
                        variant={
                          tx.status === 'SUCCESS'
                            ? 'default'
                            : tx.status === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                  {i < transactions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No transactions yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
