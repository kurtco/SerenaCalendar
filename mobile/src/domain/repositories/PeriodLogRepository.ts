import { PeriodLog } from '../entities/PeriodLog';

export interface PeriodLogRepository {
  save(log: PeriodLog): Promise<void>;
  update(log: PeriodLog): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<PeriodLog | null>;
  listAll(): Promise<PeriodLog[]>;
}
