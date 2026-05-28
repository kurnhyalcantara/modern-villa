import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';

import { UserTable } from './user-table';

export const metadata: Metadata = { title: 'Users' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users and their roles
        </p>
      </div>
      <Suspense fallback={<DataTableSkeleton />}>
        <UserTable searchParams={params} />
      </Suspense>
    </div>
  );
}
