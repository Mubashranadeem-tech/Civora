export declare function getDb(connectionString?: string): import("node_modules/drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, unknown>>;
export type Database = ReturnType<typeof getDb>;
export * from './schema';
