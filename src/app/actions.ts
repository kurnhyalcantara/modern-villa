import type { VillaCardData } from '@/types/villa';

import { villaService } from '@/services/villa.service';

export async function getFeaturedVillas(): Promise<VillaCardData[]> {
  try {
    return await villaService.getFeatured();
  } catch {
    return [];
  }
}
