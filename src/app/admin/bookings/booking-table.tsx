import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_VARIANT } from '@/constants/booking';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';
import { formatRupiah } from '@/lib/currency';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { StatusFilter } from '../_components/status-filter';
import { BookingStatusSelect } from './booking-status-select';

interface BookingRow {
  id: string;
  villa: { title: string; location: string };
  user: { fullName: string; email: string };
  checkIn: Date;
  checkOut: Date;
  totalPrice: unknown;
  status: string;
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function BookingTable({ searchParams }: Props) {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);
  requireRole(user, 'ADMIN');

  const columns: Column<BookingRow>[] = [
    {
      key: 'villa',
      header: t('admin.bookings.col_villa'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.villa.title}</p>
          <p className="text-muted-foreground text-xs">{row.villa.location}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: t('admin.bookings.col_guest'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.user.fullName}</p>
          <p className="text-muted-foreground text-xs">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: t('admin.bookings.col_dates'),
      render: (row) =>
        `${new Date(row.checkIn).toLocaleDateString()} — ${new Date(row.checkOut).toLocaleDateString()}`,
    },
    {
      key: 'price',
      header: t('admin.bookings.col_total'),
      render: (row) => formatRupiah(row.totalPrice),
    },
    {
      key: 'status',
      header: t('admin.bookings.col_status'),
      render: (row) => (
        <Badge variant={BOOKING_STATUS_VARIANT[row.status] ?? 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <BookingStatusSelect bookingId={row.id} currentStatus={row.status} />
      ),
    },
  ];

  const statusOptions = [
    { value: 'PENDING', label: t('admin.bookings.status_pending') },
    { value: 'PAID', label: t('admin.bookings.status_paid') },
    { value: 'CANCELLED', label: t('admin.bookings.status_cancelled') },
    { value: 'EXPIRED', label: t('admin.bookings.status_expired') },
  ];

  const page = Number(searchParams.page) || 1;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const { bookings, total } = await adminService.getBookings({
    page,
    limit: 10,
    status,
  });

  return (
    <div className="space-y-4">
      <StatusFilter
        basePath="/admin/bookings"
        options={statusOptions}
        allLabel={t('admin.bookings.all_statuses')}
      />
      <DataTable
        columns={columns}
        data={bookings}
        keyExtractor={(b) => b.id}
        emptyMessage={t('admin.bookings.empty')}
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/bookings"
      />
    </div>
  );
}
