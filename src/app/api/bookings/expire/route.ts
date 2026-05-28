import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { bookingService } from '@/services/booking.service';

export const POST = withErrorHandler(async () => {
  const count = await bookingService.expireStaleBookings();
  return successResponse({ expired: count });
});
