import type { Metadata } from 'next';

import { getCurrentUser, requireRole } from '@/lib/auth';
import { featureFlagService } from '@/services/feature-flag.service';

import { FeatureFlagsContent } from './feature-flags-content';

export const metadata: Metadata = { title: 'Feature Flags' };

export default async function FeatureFlagsPage() {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const flags = await featureFlagService.getAllFlags();
  return <FeatureFlagsContent initialFlags={flags} />;
}
