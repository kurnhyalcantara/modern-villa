import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const bookingRepository = {
  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { user: true, villa: true, payment: true },
    });
  },

  create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data });
  },

  update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }) {
    return prisma.booking.findMany({
      ...params,
      include: { user: true, villa: true, payment: true },
    });
  },

  count(where?: Prisma.BookingWhereInput) {
    return prisma.booking.count({ where });
  },

  findOverlapping(villaId: string, checkIn: Date, checkOut: Date) {
    return prisma.booking.findMany({
      where: {
        villaId,
        status: { in: ['PENDING', 'PAID'] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
  },
};
