'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';

interface SearchFormProps {
  basePath: string;
  placeholder?: string;
}

export function SearchForm({
  basePath,
  placeholder = 'Search...',
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [value, router, searchParams, basePath],
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9"
        />
      </div>
    </form>
  );
}
