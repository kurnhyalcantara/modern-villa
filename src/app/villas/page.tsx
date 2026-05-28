import type { Metadata } from 'next';
import { Suspense } from 'react';

import { VillaGridSkeleton } from '@/components/villa-card-skeleton';

import { VillaListingContent } from './villa-listing-content';

export const metadata: Metadata = {
  title: 'Explore Villas',
  description:
    'Browse and filter premium villas. Find the perfect property for your next getaway.',
};

interface VillasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VillasPage({ searchParams }: VillasPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Explore Villas</h1>
        <p className="text-muted-foreground mt-2">
          Find your perfect villa from our curated collection
        </p>
      </div>

      <Suspense fallback={<VillaGridSkeleton count={9} />}>
        <VillaListingContent searchParams={params} />
      </Suspense>
    </div>
  );
}
