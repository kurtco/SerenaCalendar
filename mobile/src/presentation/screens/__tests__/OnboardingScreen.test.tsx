import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DependenciesProvider } from '../../providers/DependenciesProvider';
import { OnboardingScreen } from '../OnboardingScreen';
import { CompleteOnboardingUseCase } from '../../../domain/use-cases/CompleteOnboardingUseCase';
import { SaveCycleUseCase } from '../../../domain/use-cases/SaveCycleUseCase';
import { PreferencesRepository } from '../../../domain/repositories/PreferencesRepository';
import { CycleRepository } from '../../../domain/repositories/CycleRepository';

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

class FakeCycleRepository implements CycleRepository {
  save = jest.fn().mockResolvedValue(undefined);
  update = jest.fn().mockResolvedValue(undefined);
  remove = jest.fn().mockResolvedValue(undefined);
  findById = jest.fn().mockResolvedValue(null);
  listAll = jest.fn().mockResolvedValue([]);
}

describe('OnboardingScreen', () => {
  it('renders and completes onboarding', async () => {
    const prefs = new FakePreferencesRepository();
    const cycles = new FakeCycleRepository();
    const deps = {
      completeOnboarding: new CompleteOnboardingUseCase(prefs),
      saveCycle: new SaveCycleUseCase(cycles),
      prefs,
      cipher: {
        encrypt: jest.fn().mockResolvedValue(''),
        decrypt: jest.fn().mockResolvedValue(''),
      },
    };

    const onComplete = jest.fn();
    const result = await render(
      <DependenciesProvider deps={deps}>
        <OnboardingScreen onComplete={onComplete} />
      </DependenciesProvider>
    );

    expect(result.getByText('Bienvenida a Serena')).toBeTruthy();
    fireEvent.press(result.getByTestId('onboarding-button'));

    expect(prefs.getOnboardingCompleted()).toBe(true);
    expect(onComplete).toHaveBeenCalled();
  });
});
