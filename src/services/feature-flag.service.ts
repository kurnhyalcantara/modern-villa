import { ConflictError, NotFoundError } from '@/lib/errors';
import { featureFlagRepository } from '@/repositories/feature-flag.repository';
import type {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from '@/validations/feature-flag';

const CACHE_TTL_MS = 30_000;

interface FlagCache {
  flags: Record<string, string>;
  expiresAt: number;
}

let flagCache: FlagCache | null = null;

function parseFlagValue(value: string, type: string): boolean | string | number {
  if (type === 'BOOLEAN') return value === 'true';
  if (type === 'NUMBER') return Number(value);
  return value;
}

export const featureFlagService = {
  async getAllFlags() {
    return featureFlagRepository.findAll();
  },

  async getFlagByKey(key: string) {
    return featureFlagRepository.findByKey(key);
  },

  async getActiveFlags(): Promise<Record<string, boolean | string | number>> {
    const now = Date.now();
    if (flagCache && flagCache.expiresAt > now) {
      return Object.fromEntries(
        Object.entries(flagCache.flags).map(([k, v]) => [k, v]),
      ) as Record<string, boolean | string | number>;
    }

    const flags = await featureFlagRepository.findAllActive();
    const raw: Record<string, string> = {};
    const parsed: Record<string, boolean | string | number> = {};

    for (const flag of flags) {
      raw[flag.key] = flag.value;
      parsed[flag.key] = parseFlagValue(flag.value, flag.type);
    }

    flagCache = { flags: raw, expiresAt: now + CACHE_TTL_MS };
    return parsed;
  },

  async isFlagEnabled(key: string): Promise<boolean> {
    const flags = await featureFlagService.getActiveFlags();
    return flags[key] === true;
  },

  invalidateCache() {
    flagCache = null;
  },

  async create(adminId: string, input: CreateFeatureFlagInput) {
    const existing = await featureFlagRepository.findByKey(input.key);
    if (existing) throw new ConflictError(`Feature flag '${input.key}' already exists`);

    const flag = await featureFlagRepository.create({
      key: input.key,
      description: input.description,
      value: input.value,
      type: input.type,
      isActive: input.isActive,
    });

    featureFlagService.invalidateCache();

    return { flag, adminId };
  },

  async update(adminId: string, id: string, input: UpdateFeatureFlagInput) {
    const existing = await featureFlagRepository.findById(id);
    if (!existing) throw new NotFoundError('Feature flag not found');

    const previousValue = existing.value;

    const flag = await featureFlagRepository.update(id, {
      ...(input.description !== undefined && { description: input.description }),
      ...(input.value !== undefined && { value: input.value }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });

    featureFlagService.invalidateCache();

    return { flag, previousValue, adminId };
  },

  async delete(adminId: string, id: string) {
    const existing = await featureFlagRepository.findById(id);
    if (!existing) throw new NotFoundError('Feature flag not found');

    await featureFlagRepository.delete(id);
    featureFlagService.invalidateCache();

    return { adminId, key: existing.key };
  },
};
