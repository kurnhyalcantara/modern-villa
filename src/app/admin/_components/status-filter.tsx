'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusFilterProps {
  basePath: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}

export function StatusFilter({
  basePath,
  options,
  allLabel = 'All',
}: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const current = searchParams.get('status') ?? 'all';

  const handleChange = useCallback(
    (v: string | null) => {
      if (!v) return;
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (v === 'all') {
        params.delete('status');
      } else {
        params.set('status', v);
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [router, searchParams, basePath],
  );

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
