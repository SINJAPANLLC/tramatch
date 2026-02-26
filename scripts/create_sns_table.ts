import { Pool } from "@neondatabase/serverless";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
pool.query(`
  CREATE TABLE IF NOT EXISTS sns_auto_posts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    posted_at TIMESTAMP,
    external_id TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  )
`).then(() => { console.log("Table created"); return pool.end(); }).catch((e: any) => { console.error(e); pool.end(); });
