import { Home } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';

export default function VillaNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={Home}
        title="Villa not found"
        description="The villa you're looking for doesn't exist or has been removed."
      >
        <Link
          href="/villas"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Browse all villas
        </Link>
      </EmptyState>
    </div>
  );
}
