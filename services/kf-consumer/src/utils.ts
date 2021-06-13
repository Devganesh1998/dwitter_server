import redis from 'redis';
import { promisify } from 'util';
import { SESSION_EXPIRE_IN_S } from './config';
import { CustomRedisClient } from '../types';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '', 10) || 6379;

export const getRedisClient = (): CustomRedisClient => {
    const redisClient: any = redis.createClient({
        host: REDIS_HOST,
        port: REDIS_PORT,
    });
    redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
    redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
    redisClient.llenAsync = promisify(redisClient.llen).bind(redisClient);
    redisClient.hsetAsync = promisify(redisClient.hset).bind(redisClient);
    redisClient.hgetAsync = promisify(redisClient.hget).bind(redisClient);
    redisClient.rpushAsync = promisify(redisClient.rpush).bind(redisClient);
    redisClient.expireAsync = promisify(redisClient.expire).bind(redisClient);
    redisClient.hexistsAsync = promisify(redisClient.hexists).bind(redisClient);
    redisClient.saddAsync = promisify(redisClient.sadd).bind(redisClient);
    redisClient.sremAsync = promisify(redisClient.srem).bind(redisClient);
    redisClient.delAsync = promisify(redisClient.del).bind(redisClient);
    redisClient.geoaddAsync = promisify(redisClient.geoadd).bind(redisClient);
    return redisClient;
};

const manageUserSessionsLink = async ({
    redisClient,
    userId,
    hashedSessionId,
}: {
    redisClient: CustomRedisClient;
    hashedSessionId: string;
    userId: string;
}): Promise<void> => {
    try {
        await redisClient.saddAsync([`userSessions:${userId}`, `session:${hashedSessionId}`]);
        await redisClient.expireAsync(`userSessions:${userId}`, SESSION_EXPIRE_IN_S);
    } catch (err) {
        console.error(err);
    }
};

export const manageSessionData = async ({
    redisClient,
    hashedSessionId,
    userId,
    city,
    country,
    region,
}: {
    redisClient: CustomRedisClient;
    hashedSessionId: string;
    userId: string;
    city: string;
    country: string;
    region: string;
}): Promise<void> => {
    try {
        const isLocationAvailable = city || country || region;
        await Promise.all(
            [
                manageUserSessionsLink({ redisClient, userId, hashedSessionId }),
                isLocationAvailable &&
                    redisClient.hsetAsync([
                        `session:${hashedSessionId}`,
                        'city',
                        city,
                        'country',
                        country,
                        'region',
                        region,
                    ]),
                redisClient.expireAsync(`session:${hashedSessionId}`, SESSION_EXPIRE_IN_S),
            ].filter(Boolean) as Promise<any>[]
        );
    } catch (err) {
        console.error(err);
    }
};

export const indexGeoInRedis = async ({
    redisClient,
    longitude,
    latitude,
    userId,
}: {
    redisClient: CustomRedisClient;
    longitude: number;
    latitude: number;
    userId: string;
}): Promise<void> => {
    try {
        await redisClient.geoaddAsync(['user:geo-index', longitude, latitude, userId]);
    } catch (err) {
        console.error(err);
    }
};
