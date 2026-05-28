import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { bookingService } from '@/services/booking.service';

export const GET = withErrorHandler(async (_request: NextRequest, context) => {
  const user = await getCurrentUser();
  const { id } = await context.params;
  if (!id) throw new BadRequestError('Booking ID is required');
  const booking = await bookingService.getById(user.id, id);
  return successResponse(booking);
});
