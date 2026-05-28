import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { i18nService } from '@/services/i18n.service';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get('languageId');
  if (!languageId) throw new BadRequestError('languageId is required');

  const missing = await i18nService.getMissingTranslations(languageId);
  return successResponse(missing);
});
