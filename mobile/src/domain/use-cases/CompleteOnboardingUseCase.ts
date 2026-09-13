import { PreferencesRepository } from '../repositories/PreferencesRepository';

export class CompleteOnboardingUseCase {
  constructor(private readonly prefs: PreferencesRepository) {}

  execute(): void {
    this.prefs.setOnboardingCompleted(true);
  }
}
