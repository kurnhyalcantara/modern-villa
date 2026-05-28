import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';

import { TransactionTables } from './transaction-tables';

export const metadata: Metadata = { title: 'Transactions' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage deposits and withdrawals
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton rows={8} />}>
        <TransactionTables searchParams={params} />
      </Suspense>
    </div>
  );
}
