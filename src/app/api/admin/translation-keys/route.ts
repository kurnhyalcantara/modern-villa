import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { paginatedResponse, successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { i18nService } from '@/services/i18n.service';
import { createTranslationKeySchema } from '@/validations/i18n';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') ?? undefined;

  const { keys, total } = await i18nService.getTranslationKeys({
    page,
    limit,
    search,
  });
  return paginatedResponse(keys, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const body: unknown = await request.json();
  const input = validate(createTranslationKeySchema, body);
  const key = await i18nService.createTranslationKey(input);
  return successResponse(key, 201);
});
