import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { adminService } from '@/services/admin.service';

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const analytics = await adminService.getAnalytics();
  return successResponse(analytics);
});
