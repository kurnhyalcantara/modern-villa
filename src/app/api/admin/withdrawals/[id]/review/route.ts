import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { financeService } from '@/services/finance.service';
import { adminReviewWithdrawalSchema } from '@/validations/finance';

export const POST = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const params = await context.params;
    const id = params['id']!;
    const body = await request.json();
    const input = validate(adminReviewWithdrawalSchema, body);
    const withdrawal = await financeService.adminReviewWithdrawal(user.id, id, input);
    return successResponse(withdrawal);
  },
);
