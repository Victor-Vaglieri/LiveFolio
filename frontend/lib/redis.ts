import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // TODO - usar variável de ambiente e não hardcoded

export const redis = new Redis(redisUrl);
