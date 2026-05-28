import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { i18nService } from '@/services/i18n.service';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') ?? 'en';

  const dictionary = await i18nService.getDictionary(lang);
  return successResponse(dictionary);
});
