import { db } from './db';

export async function initSettingsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT
    );
  `);
  
  // Valores padrão
  const defaults = [
    { key: 'hire_status', value: 'available' },
    { key: 'company_name', value: '' },
    { key: 'bio', value: 'Fullstack Developer & AI Engineering Student. Specialized in event-driven architectures and real-time data pipelines.' },
    { key: 'role', value: 'Fullstack Developer & AI Engineering Student' },
    { key: 'featured_projects', value: 'Victor-Vaglieri/LiveFolio,Victor-Vaglieri/AppControle,Victor-Vaglieri/AI-DE-S' }
  ];

  for (const item of defaults) {
    await db.query(`
      INSERT INTO settings (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO NOTHING;
    `, [item.key, item.value]);
  }
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const res = await db.query('SELECT key, value FROM settings');
    return res.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  } catch (e) {
    return {};
  }
}
