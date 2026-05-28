import { villaService } from '@/services/villa.service';
import type { VillaFilterParams } from '@/types/villa';

export async function getVillas(params: VillaFilterParams) {
  try {
    return await villaService.getList(params);
  } catch {
    return {
      villas: [],
      total: 0,
      totalPages: 0,
      currentPage: params.page ?? 1,
    };
  }
}
