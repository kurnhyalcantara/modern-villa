import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const paymentReceiverAccountRepository = {
  findAll() {
    return prisma.paymentReceiverAccount.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  },

  findAllActive() {
    return prisma.paymentReceiverAccount.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  },

  findDefault() {
    return prisma.paymentReceiverAccount.findFirst({
      where: { isActive: true, isDefault: true },
      orderBy: { displayOrder: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.paymentReceiverAccount.findUnique({ where: { id } });
  },

  create(data: Prisma.PaymentReceiverAccountCreateInput) {
    return prisma.paymentReceiverAccount.create({ data });
  },

  update(id: string, data: Prisma.PaymentReceiverAccountUpdateInput) {
    return prisma.paymentReceiverAccount.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.paymentReceiverAccount.delete({ where: { id } });
  },

  clearDefault() {
    return prisma.paymentReceiverAccount.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  },

  count(where?: Prisma.PaymentReceiverAccountWhereInput) {
    return prisma.paymentReceiverAccount.count({ where });
  },
};
