import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl && process.env.NODE_ENV === 'production') {
  console.warn('[AVISO] REDIS_URL não está definida. O Redis pode falhar em tempo de execução.');
}

export const redis = new Redis(redisUrl || 'redis://localhost:6379');
