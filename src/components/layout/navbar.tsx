'use client';

import {
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', labelKey: 'navbar.home', icon: Home },
  { href: '/villas', labelKey: 'navbar.explore', icon: Search },
];

export interface NavbarUser {
  fullName: string;
  email: string;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
}

interface NavbarProps {
  user?: NavbarUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Logout failed');
    }
  }, [router]);

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-ocean flex size-8 items-center justify-center rounded-lg">
            <Home className="text-ocean-foreground size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Modern Villa
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-ocean bg-ocean/10'
                  : 'text-muted-foreground',
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        {/* Desktop auth + language area */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'flex items-center gap-2 px-2',
                )}
              >
                <Avatar className="size-7">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-ocean/10 text-ocean text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {user.fullName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">
                    {user.fullName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="size-4" />
                  {t('navbar.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/profile')}
                >
                  <Settings className="size-4" />
                  {t('navbar.profile')}
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <ShieldCheck className="size-4" />
                    {t('navbar.admin_panel')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  {t('navbar.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                {t('navbar.login')}
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'bg-ocean hover:bg-ocean/90 text-ocean-foreground',
                )}
              >
                {t('navbar.signup')}
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-ocean bg-ocean/10'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <link.icon className="size-4" />
                {t(link.labelKey)}
              </Link>
            ))}

            <Separator className="my-2" />
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>

            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <Avatar className="size-7">
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback className="bg-ocean/10 text-ocean text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.fullName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="size-4" />
                  {t('navbar.dashboard')}
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Settings className="size-4" />
                  {t('navbar.profile')}
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <ShieldCheck className="size-4" />
                    {t('navbar.admin_panel')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-muted-foreground hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="size-4" />
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'flex-1',
                  )}
                >
                  <User className="size-4" />
                  {t('navbar.login')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'bg-ocean hover:bg-ocean/90 text-ocean-foreground flex-1',
                  )}
                >
                  {t('navbar.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
