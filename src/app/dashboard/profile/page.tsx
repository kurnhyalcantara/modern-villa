import type { Metadata } from 'next';

import { getCurrentUser } from '@/lib/auth';

import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>
      <ProfileForm
        defaultValues={{ fullName: user.fullName }}
        email={user.email}
      />
    </div>
  );
}
