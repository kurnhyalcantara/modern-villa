import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { featureFlagService } from '@/services/feature-flag.service';
import { createFeatureFlagSchema } from '@/validations/feature-flag';

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const flags = await featureFlagService.getActiveFlags();
  return successResponse(flags);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const body = await request.json();
  const input = validate(createFeatureFlagSchema, body);
  const result = await featureFlagService.create(user.id, input);
  return successResponse(result.flag, 201);
});
