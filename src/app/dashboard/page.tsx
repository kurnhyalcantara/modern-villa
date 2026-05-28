import { CalendarDays, CreditCard, Wallet } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-ocean text-2xl font-bold">
              ${Number(user.balance).toLocaleString()}
            </p>
            <Link
              href="/dashboard/wallet"
              className="text-muted-foreground mt-1 inline-block text-xs hover:underline"
            >
              Manage wallet →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <CalendarDays className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/bookings"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'mt-1',
              )}
            >
              View bookings
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/wallet"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'mt-1',
              )}
            >
              View history
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
