import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const translationKeyRepository = {
  findById(id: string) {
    return prisma.translationKey.findUnique({ where: { id } });
  },

  findByKey(key: string) {
    return prisma.translationKey.findUnique({ where: { key } });
  },

  findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.TranslationKeyWhereInput;
    orderBy?: Prisma.TranslationKeyOrderByWithRelationInput;
  }) {
    return prisma.translationKey.findMany(params);
  },

  findManyWithValues(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.TranslationKeyWhereInput;
    orderBy?: Prisma.TranslationKeyOrderByWithRelationInput;
  }) {
    return prisma.translationKey.findMany({
      ...params,
      include: {
        translationValues: {
          include: { language: { select: { code: true, name: true } } },
        },
      },
    });
  },

  count(where?: Prisma.TranslationKeyWhereInput) {
    return prisma.translationKey.count({ where });
  },

  create(data: Prisma.TranslationKeyCreateInput) {
    return prisma.translationKey.create({ data });
  },

  update(id: string, data: Prisma.TranslationKeyUpdateInput) {
    return prisma.translationKey.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.translationKey.delete({ where: { id } });
  },
};

export const translationValueRepository = {
  findByLanguageAndKey(languageId: string, translationKeyId: string) {
    return prisma.translationValue.findUnique({
      where: {
        languageId_translationKeyId: { languageId, translationKeyId },
      },
    });
  },

  findDictionaryByLanguage(languageId: string) {
    return prisma.translationValue.findMany({
      where: { languageId },
      include: { translationKey: { select: { key: true } } },
    });
  },

  upsert(languageId: string, translationKeyId: string, value: string) {
    return prisma.translationValue.upsert({
      where: {
        languageId_translationKeyId: { languageId, translationKeyId },
      },
      update: { value },
      create: { languageId, translationKeyId, value },
    });
  },

  delete(id: string) {
    return prisma.translationValue.delete({ where: { id } });
  },

  count(where?: Prisma.TranslationValueWhereInput) {
    return prisma.translationValue.count({ where });
  },
};
