import { type Column, DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { adminService } from '@/services/admin.service';

import { AdminPagination } from '../_components/admin-pagination';
import { SearchForm } from '../_components/search-form';
import { UserRoleSelect } from './user-role-select';

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  balance: unknown;
  createdAt: Date;
}

const columns: Column<UserRow>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <div>
        <p className="font-medium">{row.fullName}</p>
        <p className="text-muted-foreground text-xs">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (row) => (
      <Badge variant={row.role === 'ADMIN' ? 'default' : 'secondary'}>
        {row.role}
      </Badge>
    ),
  },
  {
    key: 'balance',
    header: 'Balance',
    render: (row) => `$${Number(row.balance).toLocaleString()}`,
  },
  {
    key: 'joined',
    header: 'Joined',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: (row) => <UserRoleSelect userId={row.id} currentRole={row.role} />,
  },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export async function UserTable({ searchParams }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const { users, total } = await adminService.getUsers({
    page,
    limit: 10,
    search,
  });

  return (
    <div className="space-y-4">
      <SearchForm basePath="/admin/users" placeholder="Search users..." />
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found."
      />
      <AdminPagination
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        basePath="/admin/users"
      />
    </div>
  );
}
