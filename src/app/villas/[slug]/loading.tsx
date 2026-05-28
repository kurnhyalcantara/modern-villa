import { Skeleton } from '@/components/ui/skeleton';

export default function VillaDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-48" />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
        <Skeleton className="aspect-[16/9] rounded-xl md:col-span-3 md:row-span-2 md:aspect-[3/2]" />
        <Skeleton className="hidden aspect-[4/3] rounded-lg md:block" />
        <Skeleton className="hidden aspect-[4/3] rounded-lg md:block" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <Skeleton className="h-9 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
