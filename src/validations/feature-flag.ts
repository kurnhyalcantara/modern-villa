import { z } from 'zod';

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key too long')
    .regex(/^[a-z0-9_.]+$/, 'Key must be lowercase alphanumeric with dots or underscores'),
  description: z.string().max(500).optional(),
  value: z.string().min(1, 'Value is required'),
  type: z.enum(['BOOLEAN', 'STRING', 'NUMBER']).default('BOOLEAN'),
  isActive: z.boolean().default(true),
});

export const updateFeatureFlagSchema = z.object({
  description: z.string().max(500).optional(),
  value: z.string().min(1, 'Value is required').optional(),
  type: z.enum(['BOOLEAN', 'STRING', 'NUMBER']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;
