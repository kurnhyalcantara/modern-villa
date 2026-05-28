import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data found.',
  loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-left font-medium', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-muted/30 border-b transition-colors last:border-b-0"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
