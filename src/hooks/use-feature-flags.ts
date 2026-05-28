import { useFeatureFlagStore } from '@/store/feature-flag-store';

export function useFeatureFlags() {
  return useFeatureFlagStore((s) => s.flags);
}

export function useFlag(key: string): boolean | string | number | undefined {
  return useFeatureFlagStore((s) => s.flags[key]);
}

export function useFlagEnabled(key: string): boolean {
  return useFeatureFlagStore((s) => s.flags[key] === true);
}

export function useDepositManualEnabled(): boolean {
  return useFeatureFlagStore((s) => s.flags['deposit.manual_verification'] === true);
}

export function useDepositGatewayEnabled(): boolean {
  return useFeatureFlagStore((s) => s.flags['deposit.gateway_enabled'] === true);
}

export function useWithdrawManualEnabled(): boolean {
  return useFeatureFlagStore((s) => s.flags['withdraw.manual_review'] === true);
}

export function useWithdrawGatewayEnabled(): boolean {
  return useFeatureFlagStore((s) => s.flags['withdraw.gateway_enabled'] === true);
}

export function useMaintenanceMode(): boolean {
  return useFeatureFlagStore((s) => s.flags['maintenance_mode'] === true);
}
