export interface VillaCardData {
  id: string;
  title: string;
  slug: string;
  location: string;
  pricePerNight: number;
  maxGuests: number;
  rating: number;
  imageUrl: string | null;
}

export interface VillaDetailData extends VillaCardData {
  description: string;
  images: { id: string; imageUrl: string; order: number }[];
  reviews: VillaReview[];
  reviewCount: number;
}

export interface VillaReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    fullName: string;
    avatar: string | null;
  };
}

export type VillaSortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

export interface VillaFilterParams {
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  sort?: VillaSortOption;
  page?: number;
}
