import { create } from 'zustand';

import type { LanguageInfo, TranslationDictionary } from '@/types/i18n';

interface LanguageState {
  locale: string;
  languages: LanguageInfo[];
  translations: TranslationDictionary;
  isLoading: boolean;
  setLocale: (locale: string) => Promise<void>;
  initialize: (
    locale: string,
    languages: LanguageInfo[],
    translations: TranslationDictionary,
  ) => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  locale: 'id',
  languages: [],
  translations: {},
  isLoading: false,

  initialize(locale, languages, translations) {
    set({ locale, languages, translations });
  },

  async setLocale(locale: string) {
    const current = get();
    if (current.locale === locale) return;

    set({ isLoading: true });

    try {
      // Fetch new translations
      const res = await fetch(`/api/translations?lang=${locale}`);
      const json = await res.json();

      if (!res.ok) {
        console.error('Failed to fetch translations:', json.message);
        return;
      }

      // Set locale cookie
      document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

      set({
        locale,
        translations: json.data as TranslationDictionary,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to switch language:', error);
      set({ isLoading: false });
    }
  },
}));
