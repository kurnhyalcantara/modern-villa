import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

function createEnvValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error(
      `❌ Invalid ${label} environment variables:`,
      parsed.error.flatten().fieldErrors,
    );
    throw new Error(`Invalid ${label} environment variables`);
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  return createEnvValidation(serverEnvSchema, process.env, 'server');
}

export function getClientEnv(): ClientEnv {
  return createEnvValidation(
    clientEnvSchema,
    {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    'client',
  );
}
