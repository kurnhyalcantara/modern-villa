import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const depositRepository = {
  findById(id: string) {
    return prisma.deposit.findUnique({
      where: { id },
      include: { receiverAccount: true, user: { select: { fullName: true, email: true } } },
    });
  },

  create(data: Prisma.DepositCreateInput) {
    return prisma.deposit.create({ data });
  },

  update(id: string, data: Prisma.DepositUpdateInput) {
    return prisma.deposit.update({ where: { id }, data });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DepositWhereInput;
    orderBy?: Prisma.DepositOrderByWithRelationInput;
    include?: Prisma.DepositInclude;
  }) {
    return prisma.deposit.findMany(params);
  },

  findManyWithUser(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DepositWhereInput;
    orderBy?: Prisma.DepositOrderByWithRelationInput;
  }) {
    return prisma.deposit.findMany({
      ...params,
      include: {
        user: { select: { fullName: true, email: true } },
        receiverAccount: true,
      },
    });
  },

  count(where?: Prisma.DepositWhereInput) {
    return prisma.deposit.count({ where });
  },
};
