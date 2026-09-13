import { eq, isNull } from 'drizzle-orm';
import { db } from '../db/migrate';
import * as schema from '../db/schema';
import { PeriodLog } from '../../domain/entities/PeriodLog';
import { PeriodLogRepository } from '../../domain/repositories/PeriodLogRepository';
import { FieldCipher } from '../crypto/fieldCipher';

export class SqlitePeriodLogRepository implements PeriodLogRepository {
  constructor(private readonly cipher: FieldCipher) {}

  async save(log: PeriodLog): Promise<void> {
    const flow_cipher = log.flow ? await this.cipher.encrypt(log.flow) : null;
    await db.insert(schema.periodLogs).values({
      ...log,
      flow_cipher,
    });
  }

  async update(log: PeriodLog): Promise<void> {
    const flow_cipher = log.flow ? await this.cipher.encrypt(log.flow) : null;
    await db
      .update(schema.periodLogs)
      .set({
        ...log,
        flow_cipher,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.periodLogs.id, log.id));
  }

  async remove(id: string): Promise<void> {
    await db
      .update(schema.periodLogs)
      .set({ deleted_at: new Date().toISOString() })
      .where(eq(schema.periodLogs.id, id));
  }

  async findById(id: string): Promise<PeriodLog | null> {
    const rows = await db
      .select()
      .from(schema.periodLogs)
      .where(eq(schema.periodLogs.id, id))
      .limit(1);
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async listAll(): Promise<PeriodLog[]> {
    const rows = await db
      .select()
      .from(schema.periodLogs)
      .where(isNull(schema.periodLogs.deleted_at))
      .orderBy(schema.periodLogs.day);
    return Promise.all(rows.map((row) => this.toDomain(row)));
  }

  private async toDomain(
    row: typeof schema.periodLogs.$inferSelect
  ): Promise<PeriodLog> {
    const flow = row.flow_cipher
      ? await this.cipher.decrypt(row.flow_cipher)
      : undefined;
    return {
      id: row.id,
      cycle_id: row.cycle_id ?? undefined,
      day: row.day,
      flow: flow as PeriodLog['flow'],
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at ?? undefined,
    };
  }
}
