import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { paymentReceiverAccountService } from '@/services/payment-receiver-account.service';

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const accounts = await paymentReceiverAccountService.getAll();
  return successResponse(accounts);
});
