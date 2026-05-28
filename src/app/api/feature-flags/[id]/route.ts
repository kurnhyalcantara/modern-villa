import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { adminLogRepository } from '@/repositories/admin-log.repository';
import { featureFlagService } from '@/services/feature-flag.service';
import { updateFeatureFlagSchema } from '@/validations/feature-flag';

export const PATCH = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const params = await context.params;
    const id = params['id']!;
    const body = await request.json();
    const input = validate(updateFeatureFlagSchema, body);
    const result = await featureFlagService.update(user.id, id, input);

    await adminLogRepository.create({
      admin: { connect: { id: user.id } },
      action: `Updated feature flag '${result.flag.key}': '${result.previousValue}' → '${result.flag.value}'`,
    });

    return successResponse(result.flag);
  },
);

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const params = await context.params;
    const id = params['id']!;
    const result = await featureFlagService.delete(user.id, id);

    await adminLogRepository.create({
      admin: { connect: { id: user.id } },
      action: `Deleted feature flag '${result.key}'`,
    });

    return successResponse({ success: true });
  },
);
