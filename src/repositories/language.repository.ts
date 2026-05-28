import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const languageRepository = {
  findById(id: string) {
    return prisma.language.findUnique({ where: { id } });
  },

  findByCode(code: string) {
    return prisma.language.findUnique({ where: { code } });
  },

  findDefault() {
    return prisma.language.findFirst({ where: { isDefault: true } });
  },

  findActive() {
    return prisma.language.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.LanguageWhereInput;
    orderBy?: Prisma.LanguageOrderByWithRelationInput;
  }) {
    return prisma.language.findMany(params);
  },

  count(where?: Prisma.LanguageWhereInput) {
    return prisma.language.count({ where });
  },

  create(data: Prisma.LanguageCreateInput) {
    return prisma.language.create({ data });
  },

  update(id: string, data: Prisma.LanguageUpdateInput) {
    return prisma.language.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.language.delete({ where: { id } });
  },

  clearDefault() {
    return prisma.language.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  },
};
