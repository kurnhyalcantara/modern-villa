import { villaService } from '@/services/villa.service';
import type { VillaDetailData } from '@/types/villa';

export async function getVillaBySlug(
  slug: string,
): Promise<VillaDetailData | null> {
  try {
    return await villaService.getBySlug(slug);
  } catch {
    return null;
  }
}
