import { SymptomLog } from '../entities/SymptomLog';

export interface SymptomLogRepository {
  save(log: SymptomLog): Promise<void>;
  update(log: SymptomLog): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<SymptomLog | null>;
  listAll(): Promise<SymptomLog[]>;
}
