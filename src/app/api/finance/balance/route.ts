import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { financeService } from '@/services/finance.service';

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  const result = await financeService.getBalance(user.id);
  return successResponse(result);
});
