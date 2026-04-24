import { Pool } from 'pg';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const isProduction = process.env.NODE_ENV === 'production';
const dbHost = process.env.DB_HOST;

if (!dbHost && isProduction) {
  console.warn('[AVISO] DB_HOST não está definida. O Banco de Dados falhará em tempo de execução.');
}

const host = dbHost || 'localhost';
const useSSL = process.env.DB_SSL === 'true' || 
               (isProduction && host !== 'localhost' && host !== 'db' && !host.startsWith('127.0.0.1'));

export const db = new Pool({
  host: host,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'livefolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // Timeout para não travar o server
});
