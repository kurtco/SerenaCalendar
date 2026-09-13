import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const cycles = sqliteTable(
  'cycles',
  {
    id: text('id').primaryKey(),
    start_date: text('start_date').notNull(),
    length_days: integer('length_days'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
    deleted_at: text('deleted_at'),
  },
  (table) => [index('cycles_start_date_idx').on(table.start_date)]
);

export const periodLogs = sqliteTable(
  'period_logs',
  {
    id: text('id').primaryKey(),
    cycle_id: text('cycle_id'),
    day: text('day').notNull(),
    // encrypted at rest (AES-256-GCM)
    flow_cipher: text('flow_cipher'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
    deleted_at: text('deleted_at'),
  },
  (table) => [
    index('period_logs_day_idx').on(table.day),
    index('period_logs_cycle_id_idx').on(table.cycle_id),
  ]
);

export const symptomLogs = sqliteTable(
  'symptom_logs',
  {
    id: text('id').primaryKey(),
    day: text('day').notNull(),
    // encrypted at rest
    symptom_cipher: text('symptom_cipher').notNull(),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
    deleted_at: text('deleted_at'),
  },
  (table) => [index('symptom_logs_day_idx').on(table.day)]
);

export const moodLogs = sqliteTable(
  'mood_logs',
  {
    id: text('id').primaryKey(),
    day: text('day').notNull(),
    // encrypted at rest
    mood_cipher: text('mood_cipher').notNull(),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
    deleted_at: text('deleted_at'),
  },
  (table) => [index('mood_logs_day_idx').on(table.day)]
);
