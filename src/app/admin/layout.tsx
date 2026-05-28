import type { Metadata } from 'next';

import { SidebarNav } from '@/components/sidebar-nav';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin',
  },
};

const navItems = [
  { href: '/admin', label: 'admin.analytics', icon: 'BarChart3' as const },
  { href: '/admin/villas', label: 'admin.villas', icon: 'Home' as const },
  {
    href: '/admin/bookings',
    label: 'admin.bookings',
    icon: 'BookOpen' as const,
  },
  { href: '/admin/users', label: 'admin.users', icon: 'Users' as const },
  {
    href: '/admin/reviews',
    label: 'admin.reviews',
    icon: 'MessageSquare' as const,
  },
  {
    href: '/admin/transactions',
    label: 'admin.transactions',
    icon: 'CreditCard' as const,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <SidebarNav items={navItems} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
