import { Home } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { getServerTranslation } from '@/lib/server-translation';
import { cn } from '@/lib/utils';

export default async function VillaNotFound() {
  const { t } = await getServerTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={Home}
        title={t('villa.not_found')}
        description={t('villa.not_found_description')}
      >
        <Link
          href="/villas"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          {t('villa.browse_all')}
        </Link>
      </EmptyState>
    </div>
  );
}
