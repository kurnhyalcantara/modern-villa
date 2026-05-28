import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { BadRequestError } from '@/lib/errors';
import { bookingService } from '@/services/booking.service';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const villaId = searchParams.get('villaId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!villaId || !checkIn || !checkOut) {
    throw new BadRequestError('villaId, checkIn, and checkOut are required');
  }

  const available = await bookingService.checkAvailability(
    villaId,
    new Date(checkIn),
    new Date(checkOut),
  );

  return successResponse({ available });
});
