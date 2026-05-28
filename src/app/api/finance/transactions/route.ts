import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { paginatedResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate, paginationSchema } from '@/lib/validate';
import { financeService } from '@/services/finance.service';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const { searchParams } = request.nextUrl;

  const { page, limit } = validate(paginationSchema, {
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 10,
  });

  const { transactions, total } = await financeService.getTransactionHistory(
    user.id,
    { page, limit },
  );

  return paginatedResponse(transactions, total, page, limit);
});
