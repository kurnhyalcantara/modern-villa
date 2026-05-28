'use client';

import { useRef } from 'react';

import { useFeatureFlagStore, type FeatureFlags } from '@/store/feature-flag-store';

interface FeatureFlagProviderProps {
  flags: FeatureFlags;
  children: React.ReactNode;
}

export function FeatureFlagProvider({ flags, children }: FeatureFlagProviderProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useFeatureFlagStore.setState({ flags, isLoaded: true });
    initialized.current = true;
  }

  return <>{children}</>;
}
