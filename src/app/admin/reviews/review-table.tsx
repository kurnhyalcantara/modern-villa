import { Star } from 'lucide-react';

import { type Column, DataTable } from '@/components/data-table';
import { getCurrentUser, requireRole } from '@/lib/auth';
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

const columns: Column<ReviewRow>[] = [
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <div>
        <p className="font-medium">{row.user.fullName}</p>
        <p className="text-muted-foreground text-xs">{row.user.email}</p>
      </div>
    ),
  },
  {
    key: 'rating',
    header: 'Rating',
    render: (row) => (
      <div className="flex items-center gap-1">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium">{row.rating}</span>
      </div>
    ),
  },
  {
    key: 'comment',
    header: 'Comment',
    className: 'max-w-xs',
    render: (row) => <p className="truncate text-sm">{row.comment}</p>,
  },
  {
    key: 'date',
    header: 'Date',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: (row) => <ReviewDeleteButton reviewId={row.id} />,
  },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function ReviewTable({ searchParams }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

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
        emptyMessage="No reviews found."
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/reviews"
      />
    </div>
  );
}
