import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root and local package
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const url = process.env.DATABASE_URL || 'postgresql://civora_user:civora_pass@localhost:5432/civora';

  console.log('🔄 Running Civora database migrations on:', url.replace(/:[^:@]+@/, ':***@'));
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const migrationsFolder = path.join(__dirname, '../migrations');
  await migrate(db, { migrationsFolder });

  console.log('✅ Migrations completed successfully!');
  await client.end();
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
