import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { financeService } from '@/services/finance.service';

export const GET = withErrorHandler(
  async (_request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    const params = await context.params;
    const depositId = params['id']!;
    const deposit = await financeService.getDepositById(user.id, depositId);
    return successResponse(deposit);
  },
);
