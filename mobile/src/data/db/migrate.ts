import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from './migrations/migrations';
import * as schema from './schema';

const DB_NAME = 'serena.db';

const sqlite = openDatabaseSync(DB_NAME);
export const db = drizzle(sqlite, { schema });

export async function runMigrations(): Promise<void> {
  await migrate(db, migrations as unknown as Parameters<typeof migrate>[1]);
}
