import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/services/auth.service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url),
    );
  }

  try {
    await authService.handleOAuthCallback(code);
    return NextResponse.redirect(new URL('/', request.url));
  } catch {
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', request.url),
    );
  }
}
