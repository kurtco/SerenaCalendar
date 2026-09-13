import { create } from 'zustand';

interface UIState {
  isReady: boolean;
  setReady: (ready: boolean) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),
  onboardingCompleted: false,
  setOnboardingCompleted: (completed) =>
    set({ onboardingCompleted: completed }),
}));
