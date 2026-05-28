import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { financeService } from '@/services/finance.service';
import { withdrawSchema } from '@/validations/finance';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const body = await request.json();
  const input = validate(withdrawSchema, body);
  const withdrawal = await financeService.withdraw(user.id, input);
  return successResponse(withdrawal, 201);
});
