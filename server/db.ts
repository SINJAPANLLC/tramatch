import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const dbConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: dbConnectionString,
});

pool.on('connect', (client) => {
  client.query("SET search_path TO public");
});

export { pool as dbPool };
export const db = drizzle(pool, { schema });
