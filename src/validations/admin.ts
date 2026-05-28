import { z } from 'zod';

export const createVillaSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  pricePerNight: z.number().positive('Price must be positive'),
  maxGuests: z.number().int().positive('Guest count must be at least 1'),
});

export const updateVillaSchema = createVillaSchema.partial();

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'EXPIRED']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export type CreateVillaInput = z.infer<typeof createVillaSchema>;
export type UpdateVillaInput = z.infer<typeof updateVillaSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
