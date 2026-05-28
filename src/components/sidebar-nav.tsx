'use client';

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  Home,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  ToggleRight,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  Home,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  ToggleRight,
  User,
  Users,
  Wallet,
} as const;

type IconName = keyof typeof ICON_MAP;

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

interface SidebarNavProps {
  items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="flex gap-1 overflow-x-auto lg:flex-col"
      aria-label="Sidebar navigation"
    >
      {items.map((item) => {
        const isExact = items.some(
          (other) =>
            other.href !== item.href && other.href.startsWith(item.href),
        );
        const isActive = isExact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const IconComponent = ICON_MAP[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-ocean/10 text-ocean'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className="size-4 shrink-0" />
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
