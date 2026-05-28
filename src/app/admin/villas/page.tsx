import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { DataTableSkeleton } from '@/components/data-table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { VillaTable } from './villa-table';

export const metadata: Metadata = { title: 'Villas' };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminVillasPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Villa Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage villas
          </p>
        </div>
        <Link
          href="/admin/villas/new"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'bg-ocean hover:bg-ocean/90 text-white',
          )}
        >
          Add Villa
        </Link>
      </div>

      <Suspense fallback={<DataTableSkeleton />}>
        <VillaTable searchParams={params} />
      </Suspense>
    </div>
  );
}
