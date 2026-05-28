import { z } from 'zod';

export const createReceiverAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(100),
  accountName: z.string().min(1, 'Account name is required').max(100),
  accountNumber: z.string().min(1, 'Account number is required').max(100),
  paymentType: z.enum(['BANK_TRANSFER', 'E_WALLET']),
  qrImageUrl: z.string().url().optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateReceiverAccountSchema = createReceiverAccountSchema.partial();

export const reorderReceiverAccountsSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
});

export type CreateReceiverAccountInput = z.infer<typeof createReceiverAccountSchema>;
export type UpdateReceiverAccountInput = z.infer<typeof updateReceiverAccountSchema>;
export type ReorderReceiverAccountsInput = z.infer<typeof reorderReceiverAccountsSchema>;
