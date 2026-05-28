import type { PrismaClient } from '@/generated/prisma/client';
import type { ITXClientDenyList } from '@prisma/client/runtime/client';

import { prisma } from '@/lib/prisma';

export type TransactionClient = Omit<PrismaClient, ITXClientDenyList>;

export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
