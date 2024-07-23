import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

const getClient = (): RedisClientType => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    client.on('error', (err) => console.error('Redis error', err));
    client.connect().catch(console.error);
  }
  return client;
};

export default getClient;
