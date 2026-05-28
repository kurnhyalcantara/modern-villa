import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  return successResponse(user);
});
