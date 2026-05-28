import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { updateSupabaseSession } from '@/lib/supabase/middleware';

const SUPPORTED_LOCALES = ['en', 'id', 'jp'];
const DEFAULT_LOCALE = 'en';

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/villas',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/callback',
  '/api/villas',
  '/api/bookings/availability',
  '/api/bookings/expire',
  '/api/languages',
  '/api/translations',
];

const adminRoutes = ['/admin', '/api/admin'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function extractLocaleFromPath(pathname: string): {
  locale: string | null;
  strippedPath: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
    const strippedPath = '/' + segments.slice(1).join('/') || '/';
    return { locale: firstSegment, strippedPath };
  }

  return { locale: null, strippedPath: pathname };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle locale-prefixed routes: /en/villas → rewrite to /villas + set cookie
  const { locale: pathLocale, strippedPath } = extractLocaleFromPath(pathname);

  if (pathLocale) {
    const url = request.nextUrl.clone();
    url.pathname = strippedPath;

    const response = NextResponse.rewrite(url);
    response.cookies.set('locale', pathLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return response;
  }

  // Set default locale cookie if none exists
  const localeCookie = request.cookies.get('locale')?.value;
  const effectiveLocale =
    localeCookie && SUPPORTED_LOCALES.includes(localeCookie)
      ? localeCookie
      : DEFAULT_LOCALE;

  if (!isSupabaseConfigured()) {
    const response = NextResponse.next();
    if (!localeCookie) {
      response.cookies.set('locale', effectiveLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const { supabaseResponse, user } = await updateSupabaseSession(request);

  // Ensure locale cookie is set
  if (!localeCookie) {
    supabaseResponse.cookies.set('locale', effectiveLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  if (!user) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname)) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
