import { NotFoundError } from '@/lib/errors';
import { withTransaction } from '@/lib/transaction';
import { languageRepository } from '@/repositories/language.repository';
import {
  translationKeyRepository,
  translationValueRepository,
} from '@/repositories/translation.repository';
import type { LanguageInfo, TranslationDictionary } from '@/types/i18n';
import type {
  CreateLanguageInput,
  CreateTranslationKeyInput,
  UpdateLanguageInput,
  UpdateTranslationKeyInput,
} from '@/validations/i18n';

const DEFAULT_LOCALE = 'en';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const dictionaryCache = new Map<string, CacheEntry<TranslationDictionary>>();
let languagesCache: CacheEntry<LanguageInfo[]> | null = null;

function isCacheValid<T>(
  entry: CacheEntry<T> | null | undefined,
): entry is CacheEntry<T> {
  return !!entry && Date.now() < entry.expiresAt;
}

export const i18nService = {
  // ── Cache Management ─────────────────────────────────────
  invalidateCache(localeCode?: string) {
    if (localeCode) {
      dictionaryCache.delete(localeCode);
    } else {
      dictionaryCache.clear();
    }
    languagesCache = null;
  },

  // ── Languages ────────────────────────────────────────────
  async getActiveLanguages(): Promise<LanguageInfo[]> {
    if (isCacheValid(languagesCache)) {
      return languagesCache.data;
    }

    const languages = await languageRepository.findActive();
    const mapped: LanguageInfo[] = languages.map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      nativeName: l.nativeName,
      flagIcon: l.flagIcon,
      isDefault: l.isDefault,
    }));

    languagesCache = {
      data: mapped,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return mapped;
  },

  async getDefaultLocale(): Promise<string> {
    const languages = await this.getActiveLanguages();
    const defaultLang = languages.find((l) => l.isDefault);
    return defaultLang?.code ?? DEFAULT_LOCALE;
  },

  async isValidLocale(code: string): Promise<boolean> {
    const languages = await this.getActiveLanguages();
    return languages.some((l) => l.code === code);
  },

  // ── Translation Dictionary ───────────────────────────────
  async getDictionary(localeCode: string): Promise<TranslationDictionary> {
    const cached = dictionaryCache.get(localeCode);
    if (isCacheValid(cached)) {
      return cached.data;
    }

    const language = await languageRepository.findByCode(localeCode);
    if (!language) {
      // Fallback to default language
      const defaultLocale = await this.getDefaultLocale();
      if (localeCode !== defaultLocale) {
        return this.getDictionary(defaultLocale);
      }
      return {};
    }

    const values = await translationValueRepository.findDictionaryByLanguage(
      language.id,
    );

    const dictionary: TranslationDictionary = {};
    for (const v of values) {
      dictionary[v.translationKey.key] = v.value;
    }

    // If not default, merge with fallback for missing keys
    if (!language.isDefault) {
      const defaultLocale = await this.getDefaultLocale();
      if (defaultLocale !== localeCode) {
        const fallback = await this.getDictionary(defaultLocale);
        for (const [key, val] of Object.entries(fallback)) {
          if (!(key in dictionary)) {
            dictionary[key] = val;
          }
        }
      }
    }

    dictionaryCache.set(localeCode, {
      data: dictionary,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return dictionary;
  },

  // ── Admin: Language CRUD ─────────────────────────────────
  async getAllLanguages() {
    return languageRepository.findMany({ orderBy: { createdAt: 'asc' } });
  },

  async createLanguage(input: CreateLanguageInput) {
    return withTransaction(async (tx) => {
      if (input.isDefault) {
        await tx.language.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const language = await tx.language.create({ data: input });
      this.invalidateCache();
      return language;
    });
  },

  async updateLanguage(id: string, input: UpdateLanguageInput) {
    const existing = await languageRepository.findById(id);
    if (!existing) throw new NotFoundError('Language not found');

    return withTransaction(async (tx) => {
      if (input.isDefault) {
        await tx.language.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const language = await tx.language.update({
        where: { id },
        data: input,
      });
      this.invalidateCache();
      return language;
    });
  },

  async deleteLanguage(id: string) {
    const existing = await languageRepository.findById(id);
    if (!existing) throw new NotFoundError('Language not found');
    await languageRepository.delete(id);
    this.invalidateCache();
  },

  // ── Admin: Translation Key CRUD ──────────────────────────
  async getTranslationKeys(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const where = params.search
      ? {
          OR: [
            { key: { contains: params.search, mode: 'insensitive' as const } },
            {
              description: {
                contains: params.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    const [keys, total] = await Promise.all([
      translationKeyRepository.findManyWithValues({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { key: 'asc' },
      }),
      translationKeyRepository.count(where),
    ]);

    return { keys, total };
  },

  async createTranslationKey(input: CreateTranslationKeyInput) {
    return translationKeyRepository.create(input);
  },

  async updateTranslationKey(id: string, input: UpdateTranslationKeyInput) {
    const existing = await translationKeyRepository.findById(id);
    if (!existing) throw new NotFoundError('Translation key not found');

    const updated = await translationKeyRepository.update(id, input);
    this.invalidateCache();
    return updated;
  },

  async deleteTranslationKey(id: string) {
    const existing = await translationKeyRepository.findById(id);
    if (!existing) throw new NotFoundError('Translation key not found');
    await translationKeyRepository.delete(id);
    this.invalidateCache();
  },

  // ── Admin: Translation Value CRUD ────────────────────────
  async upsertTranslationValue(
    languageId: string,
    translationKeyId: string,
    value: string,
  ) {
    const result = await translationValueRepository.upsert(
      languageId,
      translationKeyId,
      value,
    );

    // Invalidate the specific language cache
    const language = await languageRepository.findById(languageId);
    if (language) {
      this.invalidateCache(language.code);
    }

    return result;
  },

  async bulkUpsertTranslationValues(
    languageId: string,
    translations: Array<{ translationKeyId: string; value: string }>,
  ) {
    const results = await Promise.all(
      translations.map((t) =>
        translationValueRepository.upsert(
          languageId,
          t.translationKeyId,
          t.value,
        ),
      ),
    );

    const language = await languageRepository.findById(languageId);
    if (language) {
      this.invalidateCache(language.code);
    }

    return results;
  },

  // ── Admin: Missing Translation Detection ─────────────────
  async getMissingTranslations(languageId: string) {
    const [allKeys, existingValues] = await Promise.all([
      translationKeyRepository.findMany({ orderBy: { key: 'asc' } }),
      translationValueRepository.findDictionaryByLanguage(languageId),
    ]);

    const translatedKeyIds = new Set(
      existingValues.map((v) => v.translationKeyId),
    );

    return allKeys.filter((k) => !translatedKeyIds.has(k.id));
  },
};
