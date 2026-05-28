import Image from 'next/image';

import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';
import { formatRupiah } from '@/lib/currency';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { ReviewButtons } from './approve-button';

interface DepositRow {
  id: string;
  user: { fullName: string; email: string };
  amount: unknown;
  status: string;
  evidenceUrl: string | null;
  adminNote: string | null;
  createdAt: Date;
}

interface WithdrawalRow {
  id: string;
  user: { fullName: string; email: string };
  amount: unknown;
  bankAccount: string;
  bankName: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
}

const depositStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  PENDING_VERIFICATION: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
};

const withdrawalStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  PROCESSING: 'secondary',
  APPROVED: 'default',
  COMPLETED: 'default',
  REJECTED: 'destructive',
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function TransactionTables({ searchParams }: Props) {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);
  requireRole(user, 'ADMIN');

  const depositColumns: Column<DepositRow>[] = [
    {
      key: 'user',
      header: t('admin.tx.col_user'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.user.fullName}</p>
          <p className="text-muted-foreground text-xs">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('admin.tx.col_amount'),
      render: (row) => (
        <span className="font-medium text-green-600">
          +{formatRupiah(row.amount)}
        </span>
      ),
    },
    {
      key: 'evidence',
      header: t('admin.tx.col_evidence'),
      render: (row) =>
        row.evidenceUrl ? (
          <a href={row.evidenceUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative size-10 overflow-hidden rounded border">
              <Image src={row.evidenceUrl} alt="Evidence" fill className="object-cover" />
            </div>
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: 'status',
      header: t('admin.tx.col_status'),
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={depositStatusVariant[row.status] ?? 'secondary'} className="text-xs">
            {row.status.replace('_', ' ')}
          </Badge>
          {row.adminNote && (
            <p className="text-muted-foreground max-w-[160px] truncate text-xs" title={row.adminNote}>
              {row.adminNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: t('admin.tx.col_date'),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) =>
        row.status === 'PENDING_VERIFICATION' ? (
          <ReviewButtons id={row.id} type="deposit" />
        ) : null,
    },
  ];

  const withdrawalColumns: Column<WithdrawalRow>[] = [
    {
      key: 'user',
      header: t('admin.tx.col_user'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.user.fullName}</p>
          <p className="text-muted-foreground text-xs">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('admin.tx.col_amount'),
      render: (row) => (
        <span className="font-medium text-red-600">
          -{formatRupiah(row.amount)}
        </span>
      ),
    },
    {
      key: 'bank',
      header: t('admin.tx.col_bank'),
      render: (row) => (
        <div>
          {row.bankName && <p className="text-xs font-medium">{row.bankName}</p>}
          <p className="font-mono text-sm">{row.bankAccount}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('admin.tx.col_status'),
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={withdrawalStatusVariant[row.status] ?? 'secondary'} className="text-xs">
            {row.status}
          </Badge>
          {row.adminNote && (
            <p className="text-muted-foreground max-w-[160px] truncate text-xs" title={row.adminNote}>
              {row.adminNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: t('admin.tx.col_date'),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) =>
        row.status === 'PENDING' || row.status === 'PROCESSING' ? (
          <ReviewButtons id={row.id} type="withdrawal" allowComplete />
        ) : null,
    },
  ];

  const page = Number(searchParams.page) || 1;

  const [depositsResult, withdrawalsResult] = await Promise.all([
    adminService.getDeposits({ page, limit: 10 }),
    adminService.getWithdrawals({ page, limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('admin.tx.deposits')}</h2>
        <DataTable
          columns={depositColumns}
          data={depositsResult.deposits as DepositRow[]}
          keyExtractor={(d) => d.id}
          emptyMessage={t('admin.tx.deposits_empty')}
        />
        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil(depositsResult.total / 10)}
          basePath="/admin/transactions"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('admin.tx.withdrawals')}</h2>
        <DataTable
          columns={withdrawalColumns}
          data={withdrawalsResult.withdrawals as WithdrawalRow[]}
          keyExtractor={(w) => w.id}
          emptyMessage={t('admin.tx.withdrawals_empty')}
        />
        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil(withdrawalsResult.total / 10)}
          basePath="/admin/transactions"
        />
      </div>
    </div>
  );
}
