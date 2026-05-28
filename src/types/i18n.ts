export interface LanguageInfo {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
  isDefault: boolean;
}

export type TranslationDictionary = Record<string, string>;

export interface I18nState {
  locale: string;
  languages: LanguageInfo[];
  translations: TranslationDictionary;
  isLoading: boolean;
}
