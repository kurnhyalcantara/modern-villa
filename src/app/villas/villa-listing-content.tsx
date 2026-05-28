import { EmptyState } from '@/components/empty-state';
import { VillaCard } from '@/components/villa-card';
import type { VillaFilterParams } from '@/types/villa';

import { getVillas } from './actions';
import { VillaFilters } from './villa-filters';
import { VillaPagination } from './villa-pagination';

interface VillaListingContentProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseNumberParam(
  value: string | string[] | undefined,
): number | undefined {
  const str = parseParam(value);
  if (!str) return undefined;
  const num = Number(str);
  return Number.isNaN(num) ? undefined : num;
}

export async function VillaListingContent({
  searchParams,
}: VillaListingContentProps) {
  const filters: VillaFilterParams = {
    search: parseParam(searchParams.search),
    location: parseParam(searchParams.location),
    minPrice: parseNumberParam(searchParams.minPrice),
    maxPrice: parseNumberParam(searchParams.maxPrice),
    guests: parseNumberParam(searchParams.guests),
    sort: parseParam(searchParams.sort) as VillaFilterParams['sort'],
    page: parseNumberParam(searchParams.page) ?? 1,
  };

  const { villas, total, totalPages, currentPage } = await getVillas(filters);

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.guests !== undefined;

  return (
    <div className="space-y-6">
      <VillaFilters currentFilters={filters} totalResults={total} />

      {villas.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {villas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>

          <VillaPagination currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState
          title={hasActiveFilters ? 'No villas found' : 'No villas available'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search terms.'
              : 'Check back soon for new listings.'
          }
        />
      )}
    </div>
  );
}
