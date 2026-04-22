import { db } from './db';

export async function initTrackingTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      source VARCHAR(255),
      ip VARCHAR(45),
      user_agent TEXT,
      path VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
