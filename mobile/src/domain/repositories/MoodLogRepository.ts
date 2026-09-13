import { MoodLog } from '../entities/MoodLog';

export interface MoodLogRepository {
  save(log: MoodLog): Promise<void>;
  update(log: MoodLog): Promise<void>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<MoodLog | null>;
  listAll(): Promise<MoodLog[]>;
}
