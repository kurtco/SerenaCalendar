import { Cycle } from '../entities/Cycle';
import { CycleRepository } from '../repositories/CycleRepository';

export class SaveCycleUseCase {
  constructor(private readonly cycles: CycleRepository) {}

  async execute(cycle: Cycle): Promise<void> {
    await this.cycles.save(cycle);
  }
}
