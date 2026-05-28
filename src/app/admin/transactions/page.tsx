import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';
import { getServerTranslation } from '@/lib/server-translation';

import { TransactionTables } from './transaction-tables';

export const metadata: Metadata = { title: 'Transactions' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminTransactionsPage({ searchParams }: Props) {
  const [params, { t }] = await Promise.all([searchParams, getServerTranslation()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('admin.tx.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.tx.subtitle')}
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton rows={8} />}>
        <TransactionTables searchParams={params} />
      </Suspense>
    </div>
  );
}
