import type { Metadata } from 'next';

import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a Modern Villa account to start booking premium villas.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
