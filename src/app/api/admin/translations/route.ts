import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { i18nService } from '@/services/i18n.service';
import {
  bulkUpsertTranslationValuesSchema,
  upsertTranslationValueSchema,
} from '@/validations/i18n';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const body: unknown = await request.json();
  const input = validate(upsertTranslationValueSchema, body);
  const value = await i18nService.upsertTranslationValue(
    input.languageId,
    input.translationKeyId,
    input.value,
  );
  return successResponse(value, 201);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const body: unknown = await request.json();
  const input = validate(bulkUpsertTranslationValuesSchema, body);
  const results = await i18nService.bulkUpsertTranslationValues(
    input.languageId,
    input.translations,
  );
  return successResponse(results);
});
