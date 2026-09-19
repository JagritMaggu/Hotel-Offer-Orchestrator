import { createClient } from 'redis';

// Use redis as hostname since it will run in docker-compose, or localhost for local dev
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;
export const getRedisClient = async () => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
};
