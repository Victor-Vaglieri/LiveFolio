import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl && process.env.NODE_ENV === 'production') {
  console.warn('[AVISO] REDIS_URL não está definida. O Redis pode falhar em tempo de execução.');
}

const getRedisClient = () => {
  try {
    const options: any = {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      connectTimeout: 2000,
      enableOfflineQueue: false,
    };

    const client = new Redis(redisUrl || 'redis://localhost:6379', options);

    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'production' && !redisUrl) return;
      if (err.message.includes('ECONNREFUSED')) return;
      console.error('[REDIS ERROR]', err);
    });

    return client;
  } catch (e) {
    return {
      on: () => {},
      lrange: async () => [],
      hgetall: async () => ({}),
      set: async () => {},
      get: async () => null,
      quit: async () => {},
    } as any;
  }
};

export const redis = getRedisClient();
