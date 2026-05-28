import { z } from 'zod';

export const depositSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(100_000_000, 'Amount exceeds maximum'),
  receiverAccountId: z.string().optional(),
});

export const uploadEvidenceSchema = z.object({
  evidenceUrl: z.string().url('Invalid evidence URL'),
  receiverAccountId: z.string().optional(),
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
  bankName: z.string().max(100).optional(),
});

export const adminReviewDepositSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().max(1000).optional(),
});

export const adminReviewWithdrawalSchema = z.object({
  action: z.enum(['approve', 'reject', 'complete']),
  adminNote: z.string().max(1000).optional(),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type UploadEvidenceInput = z.infer<typeof uploadEvidenceSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type AdminReviewDepositInput = z.infer<typeof adminReviewDepositSchema>;
export type AdminReviewWithdrawalInput = z.infer<typeof adminReviewWithdrawalSchema>;
