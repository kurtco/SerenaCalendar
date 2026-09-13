export interface PreferencesRepository {
  getOnboardingCompleted(): boolean;
  setOnboardingCompleted(value: boolean): void;
  getDefaultCycleLength(): number;
  setDefaultCycleLength(value: number): void;
  getDefaultPeriodLength(): number;
  setDefaultPeriodLength(value: number): void;
}
