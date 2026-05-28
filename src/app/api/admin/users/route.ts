import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { paginatedResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate, paginationSchema } from '@/lib/validate';
import { adminService } from '@/services/admin.service';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const { searchParams } = request.nextUrl;
  const { page, limit } = validate(paginationSchema, {
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 10,
  });
  const search = searchParams.get('search') ?? undefined;
  const { users, total } = await adminService.getUsers({ page, limit, search });
  return paginatedResponse(users, total, page, limit);
});
