import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const reviewRepository = {
  findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: { user: true, villa: true },
    });
  },

  create(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({ data });
  },

  update(id: string, data: Prisma.ReviewUpdateInput) {
    return prisma.review.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ReviewWhereInput;
    orderBy?: Prisma.ReviewOrderByWithRelationInput;
  }) {
    return prisma.review.findMany({
      ...params,
      include: { user: true },
    });
  },

  count(where?: Prisma.ReviewWhereInput) {
    return prisma.review.count({ where });
  },
};
