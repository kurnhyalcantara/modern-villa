'use client';

import { useRef } from 'react';

import { useLanguageStore } from '@/store/language-store';
import type { LanguageInfo, TranslationDictionary } from '@/types/i18n';

interface I18nProviderProps {
  locale: string;
  languages: LanguageInfo[];
  translations: TranslationDictionary;
  children: React.ReactNode;
}

export function I18nProvider({
  locale,
  languages,
  translations,
  children,
}: I18nProviderProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useLanguageStore.setState({ locale, languages, translations });
    initialized.current = true;
  }

  return <>{children}</>;
}
