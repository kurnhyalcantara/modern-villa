import type { Metadata } from 'next';

import { getCurrentUser } from '@/lib/auth';
import { getServerTranslation } from '@/lib/server-translation';

import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const [user, { t }] = await Promise.all([getCurrentUser(), getServerTranslation()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('profile.subtitle')}
        </p>
      </div>
      <ProfileForm
        defaultValues={{ fullName: user.fullName }}
        email={user.email}
      />
    </div>
  );
}
