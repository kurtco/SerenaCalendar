import { Cycle } from '../entities/Cycle';

export interface CycleRepository {
  save(cycle: Cycle): Promise<void>;
  update(cycle: Cycle): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<Cycle | null>;
  listAll(): Promise<Cycle[]>;
}
