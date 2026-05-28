import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { WalletContent } from './wallet-content';

export const metadata: Metadata = {
  title: 'Wallet',
};

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Manage your balance, deposits, and withdrawals
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        }
      >
        <WalletContent />
      </Suspense>
    </div>
  );
}
