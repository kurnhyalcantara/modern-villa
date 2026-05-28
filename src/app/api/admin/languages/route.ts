import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { i18nService } from '@/services/i18n.service';
import { createLanguageSchema } from '@/validations/i18n';

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const languages = await i18nService.getAllLanguages();
  return successResponse(languages);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const body: unknown = await request.json();
  const input = validate(createLanguageSchema, body);
  const language = await i18nService.createLanguage(input);
  return successResponse(language, 201);
});
