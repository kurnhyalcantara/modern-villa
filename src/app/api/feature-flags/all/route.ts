import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { featureFlagService } from '@/services/feature-flag.service';

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const flags = await featureFlagService.getAllFlags();
  return successResponse(flags);
});
