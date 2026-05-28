import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { bookingService } from '@/services/booking.service';
import { cancelBookingSchema } from '@/validations/booking';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const body = await request.json();
  const { bookingId } = validate(cancelBookingSchema, body);
  const booking = await bookingService.cancel(user.id, bookingId);
  return successResponse(booking);
});
