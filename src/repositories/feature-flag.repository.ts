import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const featureFlagRepository = {
  findAll() {
    return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  },

  findAllActive() {
    return prisma.featureFlag.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
    });
  },

  findByKey(key: string) {
    return prisma.featureFlag.findUnique({ where: { key } });
  },

  findById(id: string) {
    return prisma.featureFlag.findUnique({ where: { id } });
  },

  create(data: Prisma.FeatureFlagCreateInput) {
    return prisma.featureFlag.create({ data });
  },

  update(id: string, data: Prisma.FeatureFlagUpdateInput) {
    return prisma.featureFlag.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.featureFlag.delete({ where: { id } });
  },

  count(where?: Prisma.FeatureFlagWhereInput) {
    return prisma.featureFlag.count({ where });
  },
};
