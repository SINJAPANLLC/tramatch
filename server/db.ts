import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const dbConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: dbConnectionString,
  max: 10,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
  allowExitOnIdle: true,
});

pool.on('connect', (client) => {
  client.query("SET search_path TO public");
});

pool.on('error', (err) => {
  console.error('Database pool error (will auto-reconnect):', err.message);
});

setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 30000);

export { pool as dbPool };
export const db = drizzle(pool, { schema });
