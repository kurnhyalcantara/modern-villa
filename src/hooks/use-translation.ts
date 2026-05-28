import { useCallback } from 'react';

import { useLanguageStore } from '@/store/language-store';

export function useTranslation() {
  const { locale, translations, isLoading, setLocale, languages } =
    useLanguageStore();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[key] ?? key;

      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          value = value.replace(`{{${paramKey}}}`, String(paramValue));
        }
      }

      return value;
    },
    [translations],
  );

  return { t, locale, setLocale, isLoading, languages };
}
