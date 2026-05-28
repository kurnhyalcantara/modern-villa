import { Skeleton } from '@/components/ui/skeleton';
import { VillaGridSkeleton } from '@/components/villa-card-skeleton';

export default function VillasLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="mb-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <VillaGridSkeleton count={9} />
    </div>
  );
}
