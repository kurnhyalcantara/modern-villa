import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_VARIANT } from '@/constants/booking';
import { getCurrentUser, requireRole } from '@/lib/auth';
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

const columns: Column<BookingRow>[] = [
  {
    key: 'villa',
    header: 'Villa',
    render: (row) => (
      <div>
        <p className="font-medium">{row.villa.title}</p>
        <p className="text-muted-foreground text-xs">{row.villa.location}</p>
      </div>
    ),
  },
  {
    key: 'user',
    header: 'Guest',
    render: (row) => (
      <div>
        <p className="font-medium">{row.user.fullName}</p>
        <p className="text-muted-foreground text-xs">{row.user.email}</p>
      </div>
    ),
  },
  {
    key: 'dates',
    header: 'Dates',
    render: (row) =>
      `${new Date(row.checkIn).toLocaleDateString()} — ${new Date(row.checkOut).toLocaleDateString()}`,
  },
  {
    key: 'price',
    header: 'Total',
    render: (row) => `$${Number(row.totalPrice).toLocaleString()}`,
  },
  {
    key: 'status',
    header: 'Status',
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
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function BookingTable({ searchParams }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

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
        allLabel="All statuses"
      />
      <DataTable
        columns={columns}
        data={bookings}
        keyExtractor={(b) => b.id}
        emptyMessage="No bookings found."
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/bookings"
      />
    </div>
  );
}
