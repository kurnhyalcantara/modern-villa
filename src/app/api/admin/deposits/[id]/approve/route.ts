import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { adminService } from '@/services/admin.service';

export const POST = withErrorHandler(async (_request: NextRequest, context) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const { id } = await context.params;
  if (!id) throw new BadRequestError('Deposit ID is required');
  const deposit = await adminService.approveDeposit(user.id, id);
  return successResponse(deposit);
});
