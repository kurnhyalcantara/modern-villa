import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const paymentRepository = {
  findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.payment.findUnique({ where: { bookingId } });
  },

  create(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({ data });
  },

  update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({ where: { id }, data });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }) {
    return prisma.payment.findMany({
      ...params,
      include: { booking: true },
    });
  },

  count(where?: Prisma.PaymentWhereInput) {
    return prisma.payment.count({ where });
  },

  aggregateSum(where?: Prisma.PaymentWhereInput) {
    return prisma.payment.aggregate({ _sum: { amount: true }, where });
  },
};
