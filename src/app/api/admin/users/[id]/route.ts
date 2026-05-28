import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { validate } from '@/lib/validate';
import { adminService } from '@/services/admin.service';
import { updateUserRoleSchema } from '@/validations/admin';

export const PATCH = withErrorHandler(async (request: NextRequest, context) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const { id } = await context.params;
  if (!id) throw new BadRequestError('User ID is required');
  const body = await request.json();
  const { role } = validate(updateUserRoleSchema, body);
  const updated = await adminService.updateUserRole(user.id, id, role);
  return successResponse(updated);
});
