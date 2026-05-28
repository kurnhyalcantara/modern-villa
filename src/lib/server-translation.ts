import { cookies } from 'next/headers';

import { i18nService } from '@/services/i18n.service';

export async function getServerTranslation() {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get('locale')?.value ??
    (await i18nService.getDefaultLocale());
  const translations = await i18nService.getDictionary(locale);

  function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    let value = translations[key] ?? key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{{${paramKey}}}`, String(paramValue));
      }
    }
    return value;
  }

  return { t, locale };
}
