import { NotFoundError } from '@/lib/errors';
import { withTransaction } from '@/lib/transaction';
import { paymentReceiverAccountRepository } from '@/repositories/payment-receiver-account.repository';
import type {
  CreateReceiverAccountInput,
  ReorderReceiverAccountsInput,
  UpdateReceiverAccountInput,
} from '@/validations/payment-receiver-account';

export const paymentReceiverAccountService = {
  async getAll() {
    return paymentReceiverAccountRepository.findAll();
  },

  async getAllActive() {
    return paymentReceiverAccountRepository.findAllActive();
  },

  async getDefault() {
    return paymentReceiverAccountRepository.findDefault();
  },

  async getById(id: string) {
    const account = await paymentReceiverAccountRepository.findById(id);
    if (!account) throw new NotFoundError('Receiver account not found');
    return account;
  },

  async create(input: CreateReceiverAccountInput) {
    return withTransaction(async (tx) => {
      if (input.isDefault) {
        await tx.paymentReceiverAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.paymentReceiverAccount.create({
        data: {
          bankName: input.bankName,
          accountName: input.accountName,
          accountNumber: input.accountNumber,
          paymentType: input.paymentType,
          qrImageUrl: input.qrImageUrl ?? null,
          instructions: input.instructions ?? null,
          isActive: input.isActive,
          isDefault: input.isDefault,
          displayOrder: input.displayOrder,
        },
      });
    });
  },

  async update(id: string, input: UpdateReceiverAccountInput) {
    const existing = await paymentReceiverAccountRepository.findById(id);
    if (!existing) throw new NotFoundError('Receiver account not found');

    return withTransaction(async (tx) => {
      if (input.isDefault === true) {
        await tx.paymentReceiverAccount.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.paymentReceiverAccount.update({
        where: { id },
        data: {
          ...(input.bankName !== undefined && { bankName: input.bankName }),
          ...(input.accountName !== undefined && { accountName: input.accountName }),
          ...(input.accountNumber !== undefined && { accountNumber: input.accountNumber }),
          ...(input.paymentType !== undefined && { paymentType: input.paymentType }),
          ...(input.qrImageUrl !== undefined && { qrImageUrl: input.qrImageUrl }),
          ...(input.instructions !== undefined && { instructions: input.instructions }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
          ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        },
      });
    });
  },

  async delete(id: string) {
    const existing = await paymentReceiverAccountRepository.findById(id);
    if (!existing) throw new NotFoundError('Receiver account not found');
    await paymentReceiverAccountRepository.delete(id);
  },

  async reorder(input: ReorderReceiverAccountsInput) {
    return withTransaction(async (tx) => {
      await Promise.all(
        input.ids.map((id, index) =>
          tx.paymentReceiverAccount.update({
            where: { id },
            data: { displayOrder: index },
          }),
        ),
      );
    });
  },
};
