import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { adminService } from '@/services/admin.service';

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const { id } = await context.params;
    if (!id) throw new BadRequestError('Review ID is required');
    await adminService.deleteReview(user.id, id);
    return successResponse({ deleted: true });
  },
);
