import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { validate } from '@/lib/validate';
import { i18nService } from '@/services/i18n.service';
import { updateTranslationKeySchema } from '@/validations/i18n';

export const PATCH = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> },
  ) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');

    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) throw new BadRequestError('Missing translation key ID');
    const body: unknown = await request.json();
    const input = validate(updateTranslationKeySchema, body);
    const key = await i18nService.updateTranslationKey(id, input);
    return successResponse(key);
  },
);

export const DELETE = withErrorHandler(
  async (
    _request: NextRequest,
    { params }: { params: Promise<Record<string, string>> },
  ) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');

    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) throw new BadRequestError('Missing translation key ID');
    await i18nService.deleteTranslationKey(id);
    return successResponse({ message: 'Translation key deleted' });
  },
);
