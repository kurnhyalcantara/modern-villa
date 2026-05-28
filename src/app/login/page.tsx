import type { Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Modern Villa account.',
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirect =
    typeof params.redirect === 'string' ? params.redirect : undefined;
  const error = typeof params.error === 'string' ? params.error : undefined;

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <LoginForm redirect={redirect} error={error} />
    </div>
  );
}
