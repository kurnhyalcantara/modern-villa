import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { bookingService } from '@/services/booking.service';
import { payBookingSchema } from '@/validations/booking';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  const body = await request.json();
  const input = validate(payBookingSchema, body);
  const result = await bookingService.pay(user.id, input);
  return successResponse(result);
});
