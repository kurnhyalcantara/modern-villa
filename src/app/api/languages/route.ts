import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { i18nService } from '@/services/i18n.service';

export const GET = withErrorHandler(async () => {
  const languages = await i18nService.getActiveLanguages();
  return successResponse(languages);
});
