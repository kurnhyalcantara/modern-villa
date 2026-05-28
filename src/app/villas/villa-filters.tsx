'use client';

import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GUEST_OPTIONS, LOCATIONS, SORT_OPTIONS } from '@/constants/villa';
import type { VillaFilterParams } from '@/types/villa';

interface VillaFiltersProps {
  currentFilters: VillaFilterParams;
  totalResults: number;
}

export function VillaFilters({
  currentFilters,
  totalResults,
}: VillaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.delete('page');

      startTransition(() => {
        router.push(`/villas?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(() => {
    updateParams({ search: search || undefined });
  }, [search, updateParams]);

  const handleReset = useCallback(() => {
    setSearch('');
    startTransition(() => {
      router.push('/villas');
    });
  }, [router]);

  const hasFilters =
    currentFilters.search ||
    currentFilters.location ||
    currentFilters.guests ||
    currentFilters.sort;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search villas by name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            disabled={isPending}
          >
            Search
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/50 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={currentFilters.location ?? 'all'}
              onValueChange={(v) =>
                updateParams({ location: !v || v === 'all' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Guests</label>
            <Select
              value={currentFilters.guests?.toString() ?? 'any'}
              onValueChange={(v) =>
                updateParams({ guests: !v || v === 'any' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GUEST_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g.toString()}>
                    {g}+ guests
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={currentFilters.sort ?? 'newest'}
              onValueChange={(v) =>
                updateParams({ sort: !v || v === 'newest' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="text-muted-foreground text-sm">
              {totalResults} {totalResults === 1 ? 'villa' : 'villas'} found
            </div>
          </div>
        </div>
      )}

      {!showFilters && (
        <div className="text-muted-foreground text-sm">
          {totalResults} {totalResults === 1 ? 'villa' : 'villas'} found
        </div>
      )}
    </div>
  );
}
