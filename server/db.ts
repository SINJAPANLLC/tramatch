import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const dbConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: dbConnectionString,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});

pool.on('connect', (client) => {
  client.query("SET search_path TO public");
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

export { pool as dbPool };
export const db = drizzle(pool, { schema });
