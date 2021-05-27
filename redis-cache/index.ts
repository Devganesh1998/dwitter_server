import redis from 'redis';
import { promisifyAll } from 'bluebird';

promisifyAll(redis);

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '', 10) || 6379;

const getRedisClient = (): redis.RedisClient => {
	const redisClient: redis.RedisClient = redis.createClient({
		host: REDIS_HOST,
		port: REDIS_PORT,
	});
	return redisClient;
};

export default getRedisClient;
