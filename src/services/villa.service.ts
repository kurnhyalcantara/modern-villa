import type { Prisma } from '@/generated/prisma/client';
import { VILLAS_PER_PAGE } from '@/constants/villa';
import { villaRepository } from '@/repositories/villa.repository';
import type {
  VillaCardData,
  VillaDetailData,
  VillaFilterParams,
} from '@/types/villa';

function computeAvgRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function toVillaCard(
  villa: Awaited<
    ReturnType<typeof villaRepository.findManyWithReviews>
  >[number],
): VillaCardData {
  return {
    id: villa.id,
    title: villa.title,
    slug: villa.slug,
    location: villa.location,
    pricePerNight: Number(villa.pricePerNight),
    maxGuests: villa.maxGuests,
    rating: computeAvgRating(villa.reviews),
    imageUrl: villa.images[0]?.imageUrl ?? null,
  };
}

export const villaService = {
  async getFeatured(): Promise<VillaCardData[]> {
    const villas = await villaRepository.findManyWithReviews({
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    return villas.map(toVillaCard);
  },

  async getList(params: VillaFilterParams) {
    const page = params.page ?? 1;
    const skip = (page - 1) * VILLAS_PER_PAGE;

    const where: Prisma.VillaWhereInput = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.location) {
      where.location = { contains: params.location, mode: 'insensitive' };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (params.minPrice !== undefined) {
        where.pricePerNight.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.pricePerNight.lte = params.maxPrice;
      }
    }

    if (params.guests) {
      where.maxGuests = { gte: params.guests };
    }

    let orderBy: Prisma.VillaOrderByWithRelationInput = { createdAt: 'desc' };
    switch (params.sort) {
      case 'price-asc':
        orderBy = { pricePerNight: 'asc' };
        break;
      case 'price-desc':
        orderBy = { pricePerNight: 'desc' };
        break;
      case 'rating':
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [villas, total] = await Promise.all([
      villaRepository.findManyWithReviews({
        where,
        orderBy,
        skip,
        take: VILLAS_PER_PAGE,
      }),
      villaRepository.count(where),
    ]);

    return {
      villas: villas.map(toVillaCard),
      total,
      totalPages: Math.ceil(total / VILLAS_PER_PAGE),
      currentPage: page,
    };
  },

  async getBySlug(slug: string): Promise<VillaDetailData | null> {
    const villa = await villaRepository.findBySlugWithDetails(slug);
    if (!villa) return null;

    return {
      id: villa.id,
      title: villa.title,
      slug: villa.slug,
      description: villa.description,
      location: villa.location,
      pricePerNight: Number(villa.pricePerNight),
      maxGuests: villa.maxGuests,
      rating: computeAvgRating(villa.reviews),
      imageUrl: villa.images[0]?.imageUrl ?? null,
      images: villa.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        order: img.order,
      })),
      reviews: villa.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          fullName: review.user.fullName,
          avatar: review.user.avatar,
        },
      })),
      reviewCount: villa.reviews.length,
    };
  },
};
