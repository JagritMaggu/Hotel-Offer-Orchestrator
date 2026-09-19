"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const redis_1 = require("redis");
// Use redis as hostname since it will run in docker-compose, or localhost for local dev
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = (0, redis_1.createClient)({
    url: redisUrl
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
let isConnected = false;
const getRedisClient = async () => {
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
