import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { formatRupiah } from '@/lib/currency';
import { withTransaction } from '@/lib/transaction';
import { depositRepository } from '@/repositories/deposit.repository';
import { paymentReceiverAccountRepository } from '@/repositories/payment-receiver-account.repository';
import { withdrawalRepository } from '@/repositories/withdrawal.repository';
import type {
  AdminReviewDepositInput,
  AdminReviewWithdrawalInput,
  DepositInput,
  UploadEvidenceInput,
  WithdrawInput,
} from '@/validations/finance';

export const financeService = {
  async createDeposit(userId: string, input: DepositInput) {
    let receiverAccountId = input.receiverAccountId;

    if (!receiverAccountId) {
      let receiverAccount = await paymentReceiverAccountRepository.findDefault();
      if (!receiverAccount) {
        const activeAccounts = await paymentReceiverAccountRepository.findAllActive();
        receiverAccount = activeAccounts[0] ?? null;
      }
      receiverAccountId = receiverAccount?.id;
    }

    const deposit = await withTransaction(async (tx) => {
      return tx.deposit.create({
        data: {
          user: { connect: { id: userId } },
          amount: input.amount,
          status: 'PENDING',
          ...(receiverAccountId && {
            receiverAccount: { connect: { id: receiverAccountId } },
          }),
        },
        include: { receiverAccount: true },
      });
    });

    return deposit;
  },

  async uploadEvidence(userId: string, depositId: string, input: UploadEvidenceInput) {
    return withTransaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId } });

      if (!deposit) throw new NotFoundError('Deposit not found');
      if (deposit.userId !== userId) throw new ForbiddenError('Not authorized');
      if (deposit.status !== 'PENDING') {
        throw new BadRequestError('Evidence can only be uploaded for pending deposits');
      }
      if (deposit.evidenceUrl) {
        throw new BadRequestError('Evidence has already been uploaded for this deposit');
      }

      return tx.deposit.update({
        where: { id: depositId },
        data: {
          evidenceUrl: input.evidenceUrl,
          status: 'PENDING_VERIFICATION',
          ...(input.receiverAccountId && {
            receiverAccount: { connect: { id: input.receiverAccountId } },
          }),
        },
        include: { receiverAccount: true },
      });
    });
  },

  async adminReviewDeposit(
    adminId: string,
    depositId: string,
    input: AdminReviewDepositInput,
  ) {
    return withTransaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId } });
      if (!deposit) throw new NotFoundError('Deposit not found');
      if (deposit.status !== 'PENDING_VERIFICATION') {
        throw new BadRequestError('Deposit is not awaiting verification');
      }

      if (input.action === 'approve') {
        await tx.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.amount } },
        });

        const updated = await tx.deposit.update({
          where: { id: depositId },
          data: {
            status: 'APPROVED',
            adminNote: input.adminNote ?? null,
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
        });

        await tx.notification.create({
          data: {
            user: { connect: { id: deposit.userId } },
            title: 'Deposit Approved',
            message: `Your deposit of ${formatRupiah(Number(deposit.amount))} has been approved and added to your wallet.`,
          },
        });

        await tx.adminLog.create({
          data: {
            admin: { connect: { id: adminId } },
            action: `Approved deposit ${depositId} of ${formatRupiah(Number(deposit.amount))}`,
          },
        });

        return updated;
      }

      const updated = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: 'REJECTED',
          adminNote: input.adminNote ?? null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: deposit.userId } },
          title: 'Deposit Rejected',
          message: `Your deposit of ${formatRupiah(Number(deposit.amount))} was rejected.${input.adminNote ? ` Reason: ${input.adminNote}` : ''}`,
        },
      });

      await tx.adminLog.create({
        data: {
          admin: { connect: { id: adminId } },
          action: `Rejected deposit ${depositId} of ${formatRupiah(Number(deposit.amount))}${input.adminNote ? ` — Note: ${input.adminNote}` : ''}`,
        },
      });

      return updated;
    });
  },

  async createWithdrawal(userId: string, input: WithdrawInput) {
    return withTransaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('User not found');

      if (Number(user.balance) < input.amount) {
        throw new BadRequestError(
          `Insufficient balance. Current balance: ${formatRupiah(Number(user.balance))}`,
        );
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: input.amount } },
      });

      return tx.withdrawal.create({
        data: {
          user: { connect: { id: userId } },
          amount: input.amount,
          bankAccount: input.bankAccount,
          bankName: input.bankName ?? null,
          status: 'PENDING',
        },
      });
    });
  },

  async adminReviewWithdrawal(
    adminId: string,
    withdrawalId: string,
    input: AdminReviewWithdrawalInput,
  ) {
    return withTransaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw new NotFoundError('Withdrawal not found');

      const allowedStatuses: string[] = ['PENDING', 'PROCESSING'];
      if (!allowedStatuses.includes(withdrawal.status)) {
        throw new BadRequestError(`Withdrawal cannot be reviewed in status: ${withdrawal.status}`);
      }

      let newStatus: 'APPROVED' | 'REJECTED' | 'COMPLETED';
      if (input.action === 'approve') newStatus = 'APPROVED';
      else if (input.action === 'complete') newStatus = 'COMPLETED';
      else newStatus = 'REJECTED';

      if (input.action === 'reject') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } },
        });
      }

      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: newStatus,
          adminNote: input.adminNote ?? null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          user: { connect: { id: withdrawal.userId } },
          title: `Withdrawal ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`,
          message: `Your withdrawal of ${formatRupiah(Number(withdrawal.amount))} has been ${newStatus.toLowerCase()}.${input.adminNote ? ` Note: ${input.adminNote}` : ''}`,
        },
      });

      await tx.adminLog.create({
        data: {
          admin: { connect: { id: adminId } },
          action: `${input.action} withdrawal ${withdrawalId} of ${formatRupiah(Number(withdrawal.amount))}${input.adminNote ? ` — Note: ${input.adminNote}` : ''}`,
        },
      });

      return updated;
    });
  },

  async getBalance(userId: string) {
    const user = await withTransaction(async (tx) => {
      return tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
    });

    if (!user) throw new NotFoundError('User not found');
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
        include: { receiverAccount: true },
      }),
      depositRepository.count(where),
    ]);

    return { deposits, total };
  },

  async getDepositById(userId: string, depositId: string) {
    const deposit = await depositRepository.findById(depositId);
    if (!deposit) throw new NotFoundError('Deposit not found');
    if (deposit.userId !== userId) throw new ForbiddenError('Not authorized');

    if (!deposit.receiverAccount) {
      let receiverAccount = await paymentReceiverAccountRepository.findDefault();
      if (!receiverAccount) {
        const activeAccounts = await paymentReceiverAccountRepository.findAllActive();
        receiverAccount = activeAccounts[0] ?? null;
      }
      return { ...deposit, receiverAccount };
    }

    return deposit;
  },

  async getWithdrawals(userId: string, params: { page: number; limit: number }) {
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
    const fetchLimit = (params.page - 1) * params.limit + params.limit;

    const [depositsResult, withdrawalsResult, depositTotal, withdrawalTotal] =
      await Promise.all([
        depositRepository.findMany({
          where: { userId },
          skip: 0,
          take: fetchLimit,
          orderBy: { createdAt: 'desc' },
        }),
        withdrawalRepository.findMany({
          where: { userId },
          skip: 0,
          take: fetchLimit,
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
        status: d.status as string,
        createdAt: d.createdAt,
        description: 'Wallet Deposit',
      })),
      ...withdrawalsResult.map((w) => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: Number(w.amount),
        status: w.status as string,
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
