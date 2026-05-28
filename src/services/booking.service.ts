import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/errors';
import { formatRupiah } from '@/lib/currency';
import { withTransaction } from '@/lib/transaction';
import { bookingRepository } from '@/repositories/booking.repository';
import type {
  CreateBookingInput,
  PayBookingInput,
} from '@/validations/booking';

const BOOKING_EXPIRY_MINUTES = 30;

function calculateNights(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const bookingService = {
  async create(userId: string, input: CreateBookingInput) {
    return withTransaction(async (tx) => {
      const villa = await tx.villa.findUnique({
        where: { id: input.villaId },
      });

      if (!villa) {
        throw new NotFoundError('Villa not found');
      }

      if (input.guests > villa.maxGuests) {
        throw new BadRequestError(
          `This villa accommodates up to ${villa.maxGuests} guests`,
        );
      }

      const overlapping = await tx.booking.findMany({
        where: {
          villaId: input.villaId,
          status: { in: ['PENDING', 'PAID'] },
          checkIn: { lt: input.checkOut },
          checkOut: { gt: input.checkIn },
        },
      });

      if (overlapping.length > 0) {
        throw new ConflictError(
          'Selected dates are not available for this villa',
        );
      }

      const nights = calculateNights(input.checkIn, input.checkOut);
      const totalPrice = Number(villa.pricePerNight) * nights;

      const booking = await tx.booking.create({
        data: {
          user: { connect: { id: userId } },
          villa: { connect: { id: input.villaId } },
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          totalPrice,
          status: 'PENDING',
        },
        include: { villa: true, payment: true },
      });

      return booking;
    });
  },

  async pay(userId: string, input: PayBookingInput) {
    return withTransaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: input.bookingId },
        include: { payment: true },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to pay for this booking');
      }

      if (booking.status !== 'PENDING') {
        throw new BadRequestError(
          `Cannot pay for a booking with status: ${booking.status}`,
        );
      }

      if (isBookingExpired(booking.createdAt)) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'EXPIRED' },
        });
        throw new BadRequestError('Booking has expired');
      }

      if (booking.payment) {
        throw new ConflictError('Payment already exists for this booking');
      }

      if (input.paymentMethod === 'WALLET') {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundError('User not found');

        if (Number(user.balance) < Number(booking.totalPrice)) {
          throw new BadRequestError('Insufficient wallet balance');
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { decrement: booking.totalPrice },
          },
        });
      }

      const payment = await tx.payment.create({
        data: {
          booking: { connect: { id: booking.id } },
          amount: booking.totalPrice,
          paymentMethod: input.paymentMethod,
          status: 'SUCCESS',
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'PAID' },
        include: { villa: true, payment: true },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: userId } },
          title: 'Booking Confirmed',
          message: `Your booking has been confirmed. Payment of ${formatRupiah(Number(booking.totalPrice))} received.`,
        },
      });

      return { booking: updatedBooking, payment };
    });
  },

  async cancel(userId: string, bookingId: string) {
    return withTransaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to cancel this booking');
      }

      if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
        throw new BadRequestError(
          `Booking is already ${booking.status.toLowerCase()}`,
        );
      }

      if (
        booking.status === 'PAID' &&
        booking.payment?.status === 'SUCCESS' &&
        booking.payment.paymentMethod === 'WALLET'
      ) {
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: booking.totalPrice },
          },
        });

        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'CANCELLED' },
        });
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
        include: { villa: true, payment: true },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: userId } },
          title: 'Booking Cancelled',
          message: `Your booking has been cancelled.${
            booking.status === 'PAID' ? ' A refund has been processed.' : ''
          }`,
        },
      });

      return updatedBooking;
    });
  },

  async expireStaleBookings() {
    return withTransaction(async (tx) => {
      const cutoff = new Date(Date.now() - BOOKING_EXPIRY_MINUTES * 60 * 1000);

      const expired = await tx.booking.updateMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: cutoff },
        },
        data: { status: 'EXPIRED' },
      });

      return expired.count;
    });
  },

  async getById(userId: string, bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenError('Not authorized to view this booking');
    }

    return booking;
  },

  async getByUserId(
    userId: string,
    params: { page: number; limit: number; status?: string },
  ) {
    const where = {
      userId,
      ...(params.status
        ? {
            status: params.status as
              | 'PENDING'
              | 'PAID'
              | 'CANCELLED'
              | 'EXPIRED',
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      bookingRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      bookingRepository.count(where),
    ]);

    return { bookings, total };
  },

  async checkAvailability(villaId: string, checkIn: Date, checkOut: Date) {
    const overlapping = await bookingRepository.findOverlapping(
      villaId,
      checkIn,
      checkOut,
    );
    return overlapping.length === 0;
  },
};

function isBookingExpired(createdAt: Date): boolean {
  const expiresAt = new Date(
    createdAt.getTime() + BOOKING_EXPIRY_MINUTES * 60 * 1000,
  );
  return new Date() > expiresAt;
}
