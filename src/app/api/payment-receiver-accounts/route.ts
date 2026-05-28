import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { paymentReceiverAccountService } from '@/services/payment-receiver-account.service';
import { createReceiverAccountSchema } from '@/validations/payment-receiver-account';

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const accounts = await paymentReceiverAccountService.getAllActive();
  return successResponse(accounts);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const body = await request.json();
  const input = validate(createReceiverAccountSchema, body);
  const account = await paymentReceiverAccountService.create(input);
  return successResponse(account, 201);
});
