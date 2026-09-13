import { CompleteOnboardingUseCase } from '../CompleteOnboardingUseCase';
import { PreferencesRepository } from '../../repositories/PreferencesRepository';

class FakePreferencesRepository implements PreferencesRepository {
  onboardingCompleted = false;
  defaultCycleLength = 28;
  defaultPeriodLength = 5;

  getOnboardingCompleted(): boolean {
    return this.onboardingCompleted;
  }

  setOnboardingCompleted(value: boolean): void {
    this.onboardingCompleted = value;
  }

  getDefaultCycleLength(): number {
    return this.defaultCycleLength;
  }

  setDefaultCycleLength(value: number): void {
    this.defaultCycleLength = value;
  }

  getDefaultPeriodLength(): number {
    return this.defaultPeriodLength;
  }

  setDefaultPeriodLength(value: number): void {
    this.defaultPeriodLength = value;
  }
}

describe('CompleteOnboardingUseCase', () => {
  it('marks onboarding as completed through the preferences port', () => {
    const prefs = new FakePreferencesRepository();
    const useCase = new CompleteOnboardingUseCase(prefs);

    useCase.execute();

    expect(prefs.getOnboardingCompleted()).toBe(true);
  });
});
