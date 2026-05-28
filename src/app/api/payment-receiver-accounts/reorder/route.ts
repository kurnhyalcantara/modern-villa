import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { paymentReceiverAccountService } from '@/services/payment-receiver-account.service';
import { reorderReceiverAccountsSchema } from '@/validations/payment-receiver-account';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const body = await request.json();
  const input = validate(reorderReceiverAccountsSchema, body);
  await paymentReceiverAccountService.reorder(input);
  return successResponse({ success: true });
});
