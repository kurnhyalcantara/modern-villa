import { z } from 'zod';

import { ValidationError } from '@/lib/errors';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<
      string,
      string[]
    >;
    throw new ValidationError(fieldErrors);
  }

  return result.data;
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
