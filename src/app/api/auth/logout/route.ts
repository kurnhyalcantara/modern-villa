import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { authService } from '@/services/auth.service';

export const POST = withErrorHandler(async () => {
  await authService.logout();
  return successResponse({ message: 'Logged out successfully' });
});
