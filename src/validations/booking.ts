import { z } from 'zod';

export const createBookingSchema = z
  .object({
    villaId: z.string().min(1, 'Villa is required'),
    checkIn: z.coerce
      .date()
      .refine((d) => d >= new Date(new Date().toDateString()), {
        message: 'Check-in must be today or later',
      }),
    checkOut: z.coerce.date(),
    guests: z.number().int().positive('Guest count must be at least 1'),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  });

export const payBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentMethod: z.enum(['WALLET', 'BANK_TRANSFER']),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type PayBookingInput = z.infer<typeof payBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
