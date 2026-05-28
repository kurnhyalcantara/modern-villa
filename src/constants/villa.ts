export const VILLAS_PER_PAGE = 9;

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
] as const;

export const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12] as const;

export const LOCATIONS = [
  'Bali',
  'Lombok',
  'Yogyakarta',
  'Bandung',
  'Jakarta',
  'Ubud',
  'Seminyak',
  'Canggu',
] as const;
