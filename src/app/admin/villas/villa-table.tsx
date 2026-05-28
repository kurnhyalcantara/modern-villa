import Link from 'next/link';

import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { SearchForm } from '../_components/search-form';
import { VillaDeleteButton } from './villa-delete-button';

interface VillaRow {
  id: string;
  title: string;
  slug: string;
  location: string;
  pricePerNight: unknown;
  maxGuests: number;
  createdAt: Date;
}

const columns: Column<VillaRow>[] = [
  {
    key: 'title',
    header: 'Title',
    render: (row) => (
      <Link
        href={`/admin/villas/${row.id}/edit`}
        className="text-ocean font-medium hover:underline"
      >
        {row.title}
      </Link>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    render: (row) => row.location,
  },
  {
    key: 'price',
    header: 'Price/Night',
    render: (row) => `$${Number(row.pricePerNight).toLocaleString()}`,
  },
  {
    key: 'guests',
    header: 'Guests',
    render: (row) => <Badge variant="secondary">{row.maxGuests}</Badge>,
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: (row) => <VillaDeleteButton villaId={row.id} title={row.title} />,
  },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function VillaTable({ searchParams }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const { villas, total } = await adminService.getVillas({
    page,
    limit: 10,
    search,
  });

  return (
    <div className="space-y-4">
      <SearchForm basePath="/admin/villas" placeholder="Search villas..." />
      <DataTable
        columns={columns}
        data={villas}
        keyExtractor={(v) => v.id}
        emptyMessage="No villas found."
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/villas"
      />
    </div>
  );
}
