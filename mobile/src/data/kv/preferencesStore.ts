import { createMMKV, MMKV } from 'react-native-mmkv';
import { PreferencesRepository } from '../../domain/repositories/PreferencesRepository';

const storage: MMKV = createMMKV({ id: 'serena-preferences' });

const Keys = {
  onboardingCompleted: 'onboarding_completed',
  defaultCycleLength: 'default_cycle_length',
  defaultPeriodLength: 'default_period_length',
} as const;

export class MmkvPreferencesRepository implements PreferencesRepository {
  getOnboardingCompleted(): boolean {
    return storage.getBoolean(Keys.onboardingCompleted) ?? false;
  }

  setOnboardingCompleted(value: boolean): void {
    storage.set(Keys.onboardingCompleted, value);
  }

  getDefaultCycleLength(): number {
    return storage.getNumber(Keys.defaultCycleLength) ?? 28;
  }

  setDefaultCycleLength(value: number): void {
    storage.set(Keys.defaultCycleLength, value);
  }

  getDefaultPeriodLength(): number {
    return storage.getNumber(Keys.defaultPeriodLength) ?? 5;
  }

  setDefaultPeriodLength(value: number): void {
    storage.set(Keys.defaultPeriodLength, value);
  }
}
