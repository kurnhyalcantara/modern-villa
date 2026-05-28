import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { validate } from '@/lib/validate';
import { authService } from '@/services/auth.service';
import { registerSchema } from '@/validations/auth';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body: unknown = await request.json();
  const input = validate(registerSchema, body);
  const user = await authService.register(input);
  return successResponse(user, 201);
});
