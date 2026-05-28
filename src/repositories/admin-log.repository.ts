import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const adminLogRepository = {
  create(data: Prisma.AdminLogCreateInput) {
    return prisma.adminLog.create({ data });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AdminLogWhereInput;
    orderBy?: Prisma.AdminLogOrderByWithRelationInput;
  }) {
    return prisma.adminLog.findMany({
      ...params,
      include: { admin: true },
    });
  },

  count(where?: Prisma.AdminLogWhereInput) {
    return prisma.adminLog.count({ where });
  },
};
