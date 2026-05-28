import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { validate } from '@/lib/validate';
import { authService } from '@/services/auth.service';
import { loginSchema } from '@/validations/auth';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body: unknown = await request.json();
  const input = validate(loginSchema, body);
  const user = await authService.login(input);
  return successResponse(user);
});
