import { z } from 'zod';

export const depositSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100_000_000, 'Amount exceeds maximum'),
});

export const withdrawSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100_000_000, 'Amount exceeds maximum'),
  bankAccount: z
    .string()
    .min(5, 'Bank account is required')
    .max(50, 'Bank account too long'),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
