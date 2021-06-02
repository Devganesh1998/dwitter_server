import redis from 'redis';
import { promisify } from 'util';
import { CustomRedisClient } from '../types';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '', 10) || 6379;

const getRedisClient = (): CustomRedisClient => {
	const redisClient: any = redis.createClient({
		host: REDIS_HOST,
		port: REDIS_PORT,
	});
	redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
	redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
	redisClient.llenAsync = promisify(redisClient.llen).bind(redisClient);
	redisClient.hsetAsync = promisify(redisClient.hset).bind(redisClient);
	redisClient.rpushAsync = promisify(redisClient.rpush).bind(redisClient);
	redisClient.expireAsync = promisify(redisClient.expire).bind(redisClient);
	redisClient.hexistsAsync = promisify(redisClient.hexists).bind(redisClient);
	redisClient.saddAsync = promisify(redisClient.sadd).bind(redisClient);
	redisClient.sremAsync = promisify(redisClient.srem).bind(redisClient);
	redisClient.delAsync = promisify(redisClient.del).bind(redisClient);
	return redisClient;
};

export default getRedisClient;
