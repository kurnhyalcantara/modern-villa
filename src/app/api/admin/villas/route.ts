import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { paginatedResponse, successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate, paginationSchema } from '@/lib/validate';
import { adminService } from '@/services/admin.service';
import { createVillaSchema } from '@/validations/admin';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const { searchParams } = request.nextUrl;
  const { page, limit } = validate(paginationSchema, {
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 10,
  });
  const search = searchParams.get('search') ?? undefined;
  const { villas, total } = await adminService.getVillas({
    page,
    limit,
    search,
  });
  return paginatedResponse(villas, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const body = await request.json();
  const input = validate(createVillaSchema, body);
  const villa = await adminService.createVilla(user.id, input);
  return successResponse(villa, 201);
});
