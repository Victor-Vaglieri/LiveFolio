import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost', // TODO - usar variável de ambiente e não hardcoded
  port: parseInt(process.env.DB_PORT || '5432'), // TODO - usar variável de ambiente e não hardcoded
  database: process.env.DB_NAME || 'livefolio', // TODO - usar variável de ambiente e não hardcoded
  user: process.env.DB_USER || 'postgres', // TODO - usar variável de ambiente e não hardcoded
  password: process.env.DB_PASSWORD || 'postgres', // TODO - usar variável de ambiente e não hardcoded
});
