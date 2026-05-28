import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { validate } from '@/lib/validate';
import { adminService } from '@/services/admin.service';
import { updateVillaSchema } from '@/validations/admin';

export const PATCH = withErrorHandler(async (request: NextRequest, context) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const { id } = await context.params;
  if (!id) throw new BadRequestError('Villa ID is required');
  const body = await request.json();
  const input = validate(updateVillaSchema, body);
  const villa = await adminService.updateVilla(user.id, id, input);
  return successResponse(villa);
});

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const { id } = await context.params;
    if (!id) throw new BadRequestError('Villa ID is required');
    await adminService.deleteVilla(user.id, id);
    return successResponse({ deleted: true });
  },
);
