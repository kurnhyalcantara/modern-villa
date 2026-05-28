import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { paginatedResponse, successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate, paginationSchema } from '@/lib/validate';
import { bookingService } from '@/services/booking.service';
import { createBookingSchema } from '@/validations/booking';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const body = await request.json();
  const input = validate(createBookingSchema, body);
  const booking = await bookingService.create(user.id, input);
  return successResponse(booking, 201);
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const { searchParams } = request.nextUrl;

  const { page, limit } = validate(paginationSchema, {
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 10,
  });

  const status = searchParams.get('status') ?? undefined;

  const { bookings, total } = await bookingService.getByUserId(user.id, {
    page,
    limit,
    status,
  });

  return paginatedResponse(bookings, total, page, limit);
});
