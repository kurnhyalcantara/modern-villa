import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const notificationRepository = {
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  },

  markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }) {
    return prisma.notification.findMany(params);
  },

  count(where?: Prisma.NotificationWhereInput) {
    return prisma.notification.count({ where });
  },
};
