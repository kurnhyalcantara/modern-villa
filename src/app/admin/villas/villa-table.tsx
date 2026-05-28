import Link from 'next/link';

import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';
import { formatRupiah } from '@/lib/currency';
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

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function VillaTable({ searchParams }: Props) {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);
  requireRole(user, 'ADMIN');

  const columns: Column<VillaRow>[] = [
    {
      key: 'title',
      header: t('admin.villas.col_title'),
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
      header: t('admin.villas.col_location'),
      render: (row) => row.location,
    },
    {
      key: 'price',
      header: t('admin.villas.col_price'),
      render: (row) => formatRupiah(row.pricePerNight),
    },
    {
      key: 'guests',
      header: t('admin.villas.col_guests'),
      render: (row) => <Badge variant="secondary">{row.maxGuests}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => <VillaDeleteButton villaId={row.id} title={row.title} />,
    },
  ];

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
      <SearchForm basePath="/admin/villas" placeholder={t('admin.villas.search')} />
      <DataTable
        columns={columns}
        data={villas}
        keyExtractor={(v) => v.id}
        emptyMessage={t('admin.villas.empty')}
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/villas"
      />
    </div>
  );
}
