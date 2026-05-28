import {
  Banknote,
  BookOpen,
  CreditCard,
  Home,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';
import { formatRupiah } from '@/lib/currency';
import { adminService } from '@/services/admin.service';

export default async function AdminDashboardPage() {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);
  requireRole(user, 'ADMIN');

  const analytics = await adminService.getAnalytics();

  const cards = [
    {
      title: t('admin.analytics.total_revenue'),
      value: formatRupiah(analytics.totalRevenue),
      icon: Banknote,
      color: 'text-green-600',
    },
    {
      title: t('admin.analytics.active_bookings'),
      value: analytics.activeBookings.toString(),
      icon: TrendingUp,
      color: 'text-ocean',
    },
    {
      title: t('admin.analytics.total_bookings'),
      value: analytics.totalBookings.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: t('admin.analytics.total_users'),
      value: analytics.totalUsers.toString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: t('admin.analytics.total_villas'),
      value: analytics.totalVillas.toString(),
      icon: Home,
      color: 'text-amber-600',
    },
    {
      title: t('admin.analytics.pending_transactions'),
      value: (
        analytics.pendingDeposits + analytics.pendingWithdrawals
      ).toString(),
      icon: CreditCard,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.analytics.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.analytics.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
