import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const withdrawalRepository = {
  findById(id: string) {
    return prisma.withdrawal.findUnique({ where: { id } });
  },

  create(data: Prisma.WithdrawalCreateInput) {
    return prisma.withdrawal.create({ data });
  },

  update(id: string, data: Prisma.WithdrawalUpdateInput) {
    return prisma.withdrawal.update({ where: { id }, data });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WithdrawalWhereInput;
    orderBy?: Prisma.WithdrawalOrderByWithRelationInput;
    include?: Prisma.WithdrawalInclude;
  }) {
    return prisma.withdrawal.findMany(params);
  },

  findManyWithUser(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WithdrawalWhereInput;
    orderBy?: Prisma.WithdrawalOrderByWithRelationInput;
  }) {
    return prisma.withdrawal.findMany({
      ...params,
      include: { user: { select: { fullName: true, email: true } } },
    });
  },

  count(where?: Prisma.WithdrawalWhereInput) {
    return prisma.withdrawal.count({ where });
  },
};
