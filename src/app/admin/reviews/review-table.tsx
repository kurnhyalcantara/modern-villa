import { Star } from 'lucide-react';

import { type Column, DataTable } from '@/components/data-table';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { ReviewDeleteButton } from './review-delete-button';

interface ReviewRow {
  id: string;
  user: { fullName: string; email: string };
  rating: number;
  comment: string;
  createdAt: Date;
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function ReviewTable({ searchParams }: Props) {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);
  requireRole(user, 'ADMIN');

  const columns: Column<ReviewRow>[] = [
    {
      key: 'user',
      header: t('admin.reviews.col_user'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.user.fullName}</p>
          <p className="text-muted-foreground text-xs">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: t('admin.reviews.col_rating'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{row.rating}</span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: t('admin.reviews.col_comment'),
      className: 'max-w-xs',
      render: (row) => <p className="truncate text-sm">{row.comment}</p>,
    },
    {
      key: 'date',
      header: t('admin.reviews.col_date'),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => <ReviewDeleteButton reviewId={row.id} />,
    },
  ];

  const page = Number(searchParams.page) || 1;

  const { reviews, total } = await adminService.getReviews({
    page,
    limit: 10,
  });

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={reviews}
        keyExtractor={(r) => r.id}
        emptyMessage={t('admin.reviews.empty')}
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/reviews"
      />
    </div>
  );
}
