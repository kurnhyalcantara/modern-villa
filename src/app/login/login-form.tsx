'use client';

import { Eye, EyeOff, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  redirect?: string;
  error?: string;
}

export function LoginForm({ redirect, error }: LoginFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    } else if (error === 'missing_code') {
      toast.error('Invalid OAuth callback. Please try again.');
    }
  }, [error]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Login failed');
          return;
        }

        toast.success('Welcome back!');
        router.push(redirect ?? '/dashboard');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [email, password, redirect, router],
  );

  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google');
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? 'Failed to start Google login');
        return;
      }

      window.location.href = data.data.url;
    } catch {
      toast.error('Something went wrong');
      setGoogleLoading(false);
    }
  }, []);

  const isLoading = loading || googleLoading;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link
          href="/"
          className="mx-auto mb-4 flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <div className="bg-ocean flex size-10 items-center justify-center rounded-lg">
            <Home className="text-ocean-foreground size-5" />
          </div>
        </Link>
        <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
        <CardDescription>{t('auth.login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {t('auth.login.google')}
        </Button>

        <div className="relative">
          <Separator />
          <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
            {t('auth.or')}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.login.email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground size-4" />
                ) : (
                  <Eye className="text-muted-foreground size-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-ocean hover:bg-ocean/90 text-ocean-foreground w-full"
            disabled={isLoading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t('auth.login.submit')}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          {t('auth.login.no_account')}{' '}
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: 'link', size: 'sm' }),
              'text-ocean h-auto p-0',
            )}
          >
            {t('navbar.signup')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
