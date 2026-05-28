import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const villaRepository = {
  findById(id: string) {
    return prisma.villa.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
  },

  findBySlug(slug: string) {
    return prisma.villa.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: 'asc' } } },
    });
  },

  create(data: Prisma.VillaCreateInput) {
    return prisma.villa.create({ data });
  },

  update(id: string, data: Prisma.VillaUpdateInput) {
    return prisma.villa.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.villa.delete({ where: { id } });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.VillaWhereInput;
    orderBy?: Prisma.VillaOrderByWithRelationInput;
  }) {
    return prisma.villa.findMany({
      ...params,
      include: { images: { orderBy: { order: 'asc' } } },
    });
  },

  count(where?: Prisma.VillaWhereInput) {
    return prisma.villa.count({ where });
  },

  findManyWithReviews(params: {
    skip?: number;
    take?: number;
    where?: Prisma.VillaWhereInput;
    orderBy?: Prisma.VillaOrderByWithRelationInput;
  }) {
    return prisma.villa.findMany({
      ...params,
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        reviews: { select: { rating: true } },
      },
    });
  },

  findBySlugWithDetails(slug: string) {
    return prisma.villa.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, avatar: true } },
          },
        },
      },
    });
  },
};
