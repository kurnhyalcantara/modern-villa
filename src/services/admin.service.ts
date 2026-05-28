import { NotFoundError } from '@/lib/errors';
import { adminLogRepository } from '@/repositories/admin-log.repository';
import { bookingRepository } from '@/repositories/booking.repository';
import { depositRepository } from '@/repositories/deposit.repository';
import { paymentRepository } from '@/repositories/payment.repository';
import { reviewRepository } from '@/repositories/review.repository';
import { userRepository } from '@/repositories/user.repository';
import { villaRepository } from '@/repositories/villa.repository';
import { withdrawalRepository } from '@/repositories/withdrawal.repository';

export const adminService = {
  // ── Analytics ──────────────────────────────────────────────
  async getAnalytics() {
    const [
      totalUsers,
      totalVillas,
      totalBookings,
      activeBookings,
      revenue,
      pendingDeposits,
      pendingWithdrawals,
    ] = await Promise.all([
      userRepository.count(),
      villaRepository.count(),
      bookingRepository.count(),
      bookingRepository.count({ status: 'PAID' }),
      paymentRepository.aggregateSum({ status: 'SUCCESS' }),
      depositRepository.count({ status: 'PENDING' }),
      withdrawalRepository.count({ status: 'PENDING' }),
    ]);

    return {
      totalUsers,
      totalVillas,
      totalBookings,
      activeBookings,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      pendingDeposits,
      pendingWithdrawals,
    };
  },

  // ── Villa CRUD ─────────────────────────────────────────────
  async getVillas(params: { page: number; limit: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            {
              title: { contains: params.search, mode: 'insensitive' as const },
            },
            {
              location: {
                contains: params.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    const [villas, total] = await Promise.all([
      villaRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      villaRepository.count(where),
    ]);

    return { villas, total };
  },

  async createVilla(
    adminId: string,
    data: {
      title: string;
      slug: string;
      description: string;
      location: string;
      pricePerNight: number;
      maxGuests: number;
    },
  ) {
    const villa = await villaRepository.create({
      title: data.title,
      slug: data.slug,
      description: data.description,
      location: data.location,
      pricePerNight: data.pricePerNight,
      maxGuests: data.maxGuests,
    });

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Created villa: ${villa.title}`,
    });

    return villa;
  },

  async updateVilla(
    adminId: string,
    villaId: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      location?: string;
      pricePerNight?: number;
      maxGuests?: number;
    },
  ) {
    const existing = await villaRepository.findById(villaId);
    if (!existing) throw new NotFoundError('Villa not found');

    const villa = await villaRepository.update(villaId, data);

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Updated villa: ${villa.title}`,
    });

    return villa;
  },

  async deleteVilla(adminId: string, villaId: string) {
    const existing = await villaRepository.findById(villaId);
    if (!existing) throw new NotFoundError('Villa not found');

    await villaRepository.delete(villaId);

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Deleted villa: ${existing.title}`,
    });
  },

  // ── Booking Management ─────────────────────────────────────
  async getBookings(params: { page: number; limit: number; status?: string }) {
    const where = params.status
      ? {
          status: params.status as 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED',
        }
      : undefined;

    const [bookings, total] = await Promise.all([
      bookingRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      bookingRepository.count(where),
    ]);

    return { bookings, total };
  },

  async updateBookingStatus(
    adminId: string,
    bookingId: string,
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED',
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    const updated = await bookingRepository.update(bookingId, { status });

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Updated booking ${bookingId} status to ${status}`,
    });

    return updated;
  },

  // ── User Management ────────────────────────────────────────
  async getUsers(params: { page: number; limit: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            {
              fullName: {
                contains: params.search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: { contains: params.search, mode: 'insensitive' as const },
            },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      userRepository.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      userRepository.count(where),
    ]);

    const safeUsers = users.map(({ password: _, ...u }) => u);
    return { users: safeUsers, total };
  },

  async updateUserRole(
    adminId: string,
    userId: string,
    role: 'USER' | 'ADMIN',
  ) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await userRepository.update(userId, { role });

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Updated user ${user.email} role to ${role}`,
    });

    const { password: _, ...safe } = updated;
    return safe;
  },

  // ── Review Moderation ──────────────────────────────────────
  async getReviews(params: { page: number; limit: number }) {
    const [reviews, total] = await Promise.all([
      reviewRepository.findMany({
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      reviewRepository.count(),
    ]);

    return { reviews, total };
  },

  async deleteReview(adminId: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    await reviewRepository.delete(reviewId);

    await adminLogRepository.create({
      admin: { connect: { id: adminId } },
      action: `Deleted review ${reviewId} by ${review.user.email}`,
    });
  },

  // ── Deposit / Withdrawal Management ────────────────────────
  async getDeposits(params: { page: number; limit: number; status?: string }) {
    const where = {
      ...(params.status
        ? {
            status: params.status as
              | 'PENDING'
              | 'PENDING_VERIFICATION'
              | 'APPROVED'
              | 'REJECTED'
              | 'CANCELLED',
          }
        : {}),
    };

    const [deposits, total] = await Promise.all([
      depositRepository.findManyWithUser({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      depositRepository.count(where),
    ]);

    return { deposits, total };
  },

  async approveDeposit(adminId: string, depositId: string) {
    const { financeService } = await import('@/services/finance.service');
    return financeService.adminReviewDeposit(adminId, depositId, { action: 'approve' });
  },

  async getWithdrawals(params: {
    page: number;
    limit: number;
    status?: string;
  }) {
    const where = {
      ...(params.status
        ? {
            status: params.status as
              | 'PENDING'
              | 'PROCESSING'
              | 'APPROVED'
              | 'REJECTED'
              | 'COMPLETED',
          }
        : {}),
    };

    const [withdrawals, total] = await Promise.all([
      withdrawalRepository.findManyWithUser({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      withdrawalRepository.count(where),
    ]);

    return { withdrawals, total };
  },

  async approveWithdrawal(adminId: string, withdrawalId: string) {
    const { financeService } = await import('@/services/finance.service');
    return financeService.adminReviewWithdrawal(adminId, withdrawalId, { action: 'approve' });
  },
};
