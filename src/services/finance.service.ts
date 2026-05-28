import { BadRequestError, NotFoundError } from '@/lib/errors';
import { withTransaction } from '@/lib/transaction';
import { depositRepository } from '@/repositories/deposit.repository';
import { withdrawalRepository } from '@/repositories/withdrawal.repository';
import type { DepositInput, WithdrawInput } from '@/validations/finance';

export const financeService = {
  async deposit(userId: string, input: DepositInput) {
    return withTransaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data: {
          user: { connect: { id: userId } },
          amount: input.amount,
          status: 'PENDING',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: input.amount } },
      });

      const updatedDeposit = await tx.deposit.update({
        where: { id: deposit.id },
        data: { status: 'SUCCESS' },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: userId } },
          title: 'Deposit Successful',
          message: `$${input.amount.toLocaleString()} has been added to your wallet.`,
        },
      });

      return updatedDeposit;
    });
  },

  async withdraw(userId: string, input: WithdrawInput) {
    return withTransaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (Number(user.balance) < input.amount) {
        throw new BadRequestError(
          `Insufficient balance. Current balance: $${Number(user.balance).toLocaleString()}`,
        );
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          user: { connect: { id: userId } },
          amount: input.amount,
          bankAccount: input.bankAccount,
          status: 'PENDING',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: input.amount } },
      });

      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: 'SUCCESS' },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: userId } },
          title: 'Withdrawal Processed',
          message: `$${input.amount.toLocaleString()} has been sent to ${input.bankAccount}.`,
        },
      });

      return updatedWithdrawal;
    });
  },

  async getBalance(userId: string) {
    const user = await withTransaction(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return { balance: Number(user.balance) };
  },

  async getDeposits(userId: string, params: { page: number; limit: number }) {
    const where = { userId };
    const [deposits, total] = await Promise.all([
      depositRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      depositRepository.count(where),
    ]);

    return { deposits, total };
  },

  async getWithdrawals(
    userId: string,
    params: { page: number; limit: number },
  ) {
    const where = { userId };
    const [withdrawals, total] = await Promise.all([
      withdrawalRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      withdrawalRepository.count(where),
    ]);

    return { withdrawals, total };
  },

  async getTransactionHistory(
    userId: string,
    params: { page: number; limit: number },
  ) {
    const [depositsResult, withdrawalsResult, depositTotal, withdrawalTotal] =
      await Promise.all([
        depositRepository.findMany({
          where: { userId },
          skip: 0,
          take: (params.page - 1) * params.limit + params.limit,
          orderBy: { createdAt: 'desc' },
        }),
        withdrawalRepository.findMany({
          where: { userId },
          skip: 0,
          take: (params.page - 1) * params.limit + params.limit,
          orderBy: { createdAt: 'desc' },
        }),
        depositRepository.count({ userId }),
        withdrawalRepository.count({ userId }),
      ]);

    const transactions = [
      ...depositsResult.map((d) => ({
        id: d.id,
        type: 'deposit' as const,
        amount: Number(d.amount),
        status: d.status,
        createdAt: d.createdAt,
        description: 'Wallet Deposit',
      })),
      ...withdrawalsResult.map((w) => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: Number(w.amount),
        status: w.status,
        createdAt: w.createdAt,
        description: `Withdrawal to ${w.bankAccount}`,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = depositTotal + withdrawalTotal;
    const start = (params.page - 1) * params.limit;
    const paginated = transactions.slice(start, start + params.limit);

    return { transactions: paginated, total };
  },
};
