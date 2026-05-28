import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { userRepository } from '@/repositories/user.repository';
import { updateProfileSchema } from '@/validations/profile';

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  return successResponse(user);
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const body = await request.json();
  const input = validate(updateProfileSchema, body);
  const updated = await userRepository.update(user.id, input);
  const { password: _, ...safe } = updated;
  return successResponse(safe);
});
