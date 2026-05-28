import type { Metadata } from 'next';

import { SidebarNav } from '@/components/sidebar-nav';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Dashboard',
  },
};

const navItems = [
  {
    href: '/dashboard',
    label: 'dashboard.overview',
    icon: 'LayoutDashboard' as const,
  },
  {
    href: '/dashboard/bookings',
    label: 'dashboard.bookings',
    icon: 'CalendarDays' as const,
  },
  {
    href: '/dashboard/wallet',
    label: 'dashboard.wallet',
    icon: 'Wallet' as const,
  },
  {
    href: '/dashboard/profile',
    label: 'dashboard.profile',
    icon: 'User' as const,
  },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-52">
          <SidebarNav items={navItems} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
