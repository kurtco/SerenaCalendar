import { getOrCreateDek } from './data/crypto/keyStore';
import { createFieldCipher, FieldCipher } from './data/crypto/fieldCipher';
import { runMigrations } from './data/db/migrate';
import { SqliteCycleRepository } from './data/repositories';
import { MmkvPreferencesRepository } from './data/kv/preferencesStore';
import {
  CompleteOnboardingUseCase,
  SaveCycleUseCase,
} from './domain/use-cases';

export interface AppDependencies {
  completeOnboarding: CompleteOnboardingUseCase;
  saveCycle: SaveCycleUseCase;
  prefs: MmkvPreferencesRepository;
  cipher: FieldCipher;
}

export async function bootstrap(): Promise<AppDependencies> {
  await runMigrations();
  const dek = await getOrCreateDek();
  const cipher = await createFieldCipher(dek);

  const cycleRepo = new SqliteCycleRepository();
  const prefsRepo = new MmkvPreferencesRepository();

  return {
    completeOnboarding: new CompleteOnboardingUseCase(prefsRepo),
    saveCycle: new SaveCycleUseCase(cycleRepo),
    prefs: prefsRepo,
    cipher,
  };
}
