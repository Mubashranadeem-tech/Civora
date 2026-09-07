import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(connectionString?: string) {
  if (_db) return _db;
  const url = connectionString || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not defined');
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  const client = postgres(url, {
    max: 10,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  _db = drizzle(client, { schema });
  return _db;
}

export type Database = ReturnType<typeof getDb>;
export * from './schema';
