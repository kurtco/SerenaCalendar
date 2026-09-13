import { eq, isNull } from 'drizzle-orm';
import { db } from '../db/migrate';
import * as schema from '../db/schema';
import { Cycle } from '../../domain/entities/Cycle';
import { CycleRepository } from '../../domain/repositories/CycleRepository';

export class SqliteCycleRepository implements CycleRepository {
  async save(cycle: Cycle): Promise<void> {
    await db.insert(schema.cycles).values(cycle);
  }

  async update(cycle: Cycle): Promise<void> {
    await db
      .update(schema.cycles)
      .set({ ...cycle, updated_at: new Date().toISOString() })
      .where(eq(schema.cycles.id, cycle.id));
  }

  async remove(id: string): Promise<void> {
    await db
      .update(schema.cycles)
      .set({ deleted_at: new Date().toISOString() })
      .where(eq(schema.cycles.id, id));
  }

  async findById(id: string): Promise<Cycle | null> {
    const rows = await db
      .select()
      .from(schema.cycles)
      .where(eq(schema.cycles.id, id))
      .limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async listAll(): Promise<Cycle[]> {
    const rows = await db
      .select()
      .from(schema.cycles)
      .where(isNull(schema.cycles.deleted_at))
      .orderBy(schema.cycles.start_date);
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: typeof schema.cycles.$inferSelect): Cycle {
    return {
      id: row.id,
      start_date: row.start_date,
      length_days: row.length_days ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at ?? undefined,
    };
  }
}
