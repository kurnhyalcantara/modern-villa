import { create } from 'zustand';

export type FeatureFlags = Record<string, boolean | string | number>;

interface FeatureFlagState {
  flags: FeatureFlags;
  isLoaded: boolean;
  initialize: (flags: FeatureFlags) => void;
  setFlag: (key: string, value: boolean | string | number) => void;
  getFlag: (key: string) => boolean | string | number | undefined;
  isFlagEnabled: (key: string) => boolean;
  refreshFlags: () => Promise<void>;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  flags: {},
  isLoaded: false,

  initialize(flags: FeatureFlags) {
    set({ flags, isLoaded: true });
  },

  setFlag(key: string, value: boolean | string | number) {
    set((state) => ({ flags: { ...state.flags, [key]: value } }));
  },

  getFlag(key: string) {
    return get().flags[key];
  },

  isFlagEnabled(key: string) {
    return get().flags[key] === true;
  },

  async refreshFlags() {
    try {
      const res = await fetch('/api/feature-flags');
      if (!res.ok) return;
      const json = await res.json();
      set({ flags: json.data as FeatureFlags, isLoaded: true });
    } catch {
      // silent — retain existing flags on error
    }
  },
}));
