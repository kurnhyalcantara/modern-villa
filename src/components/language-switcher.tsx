'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, languages, setLocale, isLoading } = useTranslation();
  const router = useRouter();

  const currentLang = languages.find((l) => l.code === locale);

  const handleSelect = useCallback(
    async (code: string) => {
      await setLocale(code);
      router.refresh();
    },
    [setLocale, router],
  );

  if (languages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'gap-1.5 px-2',
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <span className="text-base leading-none" aria-hidden="true">
              {currentLang?.flagIcon ?? '🌐'}
            </span>
            <span className="hidden text-xs sm:inline">
              {currentLang?.code.toUpperCase() ?? 'EN'}
            </span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'gap-2',
              lang.code === locale && 'bg-accent font-medium',
            )}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {lang.flagIcon}
            </span>
            <span className="text-sm">{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
