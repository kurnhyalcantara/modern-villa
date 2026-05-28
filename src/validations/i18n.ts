import { z } from 'zod';

export const createLanguageSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(5, 'Code must be at most 5 characters')
    .regex(/^[a-z]+$/, 'Code must be lowercase letters only'),
  name: z.string().min(1, 'Name is required').max(50),
  nativeName: z.string().min(1, 'Native name is required').max(50),
  flagIcon: z.string().min(1, 'Flag icon is required').max(10),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateLanguageSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  nativeName: z.string().min(1).max(50).optional(),
  flagIcon: z.string().min(1).max(10).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createTranslationKeySchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(200)
    .regex(
      /^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)*$/,
      'Key must use dot notation (e.g. navbar.home)',
    ),
  description: z.string().max(500).optional(),
});

export const updateTranslationKeySchema = z.object({
  key: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)*$/)
    .optional(),
  description: z.string().max(500).optional(),
});

export const upsertTranslationValueSchema = z.object({
  languageId: z.string().min(1, 'Language ID is required'),
  translationKeyId: z.string().min(1, 'Translation key ID is required'),
  value: z.string().min(1, 'Value is required'),
});

export const bulkUpsertTranslationValuesSchema = z.object({
  languageId: z.string().min(1, 'Language ID is required'),
  translations: z.array(
    z.object({
      translationKeyId: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
export type CreateTranslationKeyInput = z.infer<
  typeof createTranslationKeySchema
>;
export type UpdateTranslationKeyInput = z.infer<
  typeof updateTranslationKeySchema
>;
export type UpsertTranslationValueInput = z.infer<
  typeof upsertTranslationValueSchema
>;
export type BulkUpsertTranslationValuesInput = z.infer<
  typeof bulkUpsertTranslationValuesSchema
>;
