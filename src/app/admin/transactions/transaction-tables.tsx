import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { ApproveButton } from './approve-button';

interface DepositRow {
  id: string;
  user: { fullName: string; email: string };
  amount: unknown;
  status: string;
  createdAt: Date;
}

interface WithdrawalRow {
  id: string;
  user: { fullName: string; email: string };
  amount: unknown;
  bankAccount: string;
  status: string;
  createdAt: Date;
}

const txStatusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  SUCCESS: 'default',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
};

const depositColumns: Column<DepositRow>[] = [
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
    key: 'amount',
    header: 'Amount',
    render: (row) => (
      <span className="font-medium text-green-600">
        +${Number(row.amount).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={txStatusVariant[row.status] ?? 'secondary'}>
        {row.status}
      </Badge>
    ),
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
    render: (row) =>
      row.status === 'PENDING' ? (
        <ApproveButton id={row.id} type="deposit" />
      ) : null,
  },
];

const withdrawalColumns: Column<WithdrawalRow>[] = [
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
    key: 'amount',
    header: 'Amount',
    render: (row) => (
      <span className="font-medium text-red-600">
        -${Number(row.amount).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'bank',
    header: 'Bank Account',
    render: (row) => row.bankAccount,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={txStatusVariant[row.status] ?? 'secondary'}>
        {row.status}
      </Badge>
    ),
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
    render: (row) =>
      row.status === 'PENDING' ? (
        <ApproveButton id={row.id} type="withdrawal" />
      ) : null,
  },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function TransactionTables({ searchParams }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const page = Number(searchParams.page) || 1;

  const [depositsResult, withdrawalsResult] = await Promise.all([
    adminService.getDeposits({ page, limit: 10 }),
    adminService.getWithdrawals({ page, limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Deposits</h2>
        <DataTable
          columns={depositColumns}
          data={depositsResult.deposits}
          keyExtractor={(d) => d.id}
          emptyMessage="No deposits found."
        />
        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil(depositsResult.total / 10)}
          basePath="/admin/transactions"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Withdrawals</h2>
        <DataTable
          columns={withdrawalColumns}
          data={withdrawalsResult.withdrawals}
          keyExtractor={(w) => w.id}
          emptyMessage="No withdrawals found."
        />
      </div>
    </div>
  );
}
