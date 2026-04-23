import { Pool } from 'pg';

if (!process.env.DB_HOST && process.env.NODE_ENV === 'production') {
  console.warn('[AVISO] DB_HOST não está definida. O Banco de Dados falhará em tempo de execução.');
}

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'livefolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
