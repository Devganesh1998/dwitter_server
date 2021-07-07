/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import { Kafka, Consumer } from 'kafkajs';
import geoIp from 'geoip-lite';
import { Client } from '@elastic/elasticsearch';
import {
    getRedisClient,
    manageSessionData,
    indexGeoInRedis,
    refreshSessionExpire,
    indexTweetData,
} from './utils';
import { SESSION_EXPIRE_IN_S } from './config';

dotenv.config();

// const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
// const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';

const kafkaClient = new Kafka({
    clientId: 'dwitter-consumer',
    brokers: ['kafka:9092'],
});

const consumer: Consumer = kafkaClient.consumer({ groupId: 'user' });

const initializeConsumption = async () => {
    let retries = 5;
    while (retries) {
        try {
            const redisClient = getRedisClient();
            const elasticClient = new Client({ node: 'http://elastic:9200' });

            await consumer.connect();
            await Promise.all([
                consumer.subscribe({ topic: 'user-login', fromBeginning: true }),
                consumer.subscribe({ topic: 'user-register', fromBeginning: true }),
                consumer.subscribe({ topic: 'session-refresh', fromBeginning: true }),
                consumer.subscribe({ topic: 'tweet-create', fromBeginning: true }),
                consumer.subscribe({ topic: 'tweet-update', fromBeginning: true }),
                consumer.subscribe({ topic: 'tweet-delete', fromBeginning: true }),
                consumer.subscribe({ topic: 'hashtag-create', fromBeginning: true }),
                consumer.subscribe({ topic: 'hashtag-update', fromBeginning: true }),
            ]);
            await consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const value = message?.value?.toString() || '';
                    const parsedValue = JSON.parse(value) || {};
                    switch (topic) {
                        case 'user-login': {
                            let userData = parsedValue;
                            const { latestClientIp, hashedSessionId, userId } = userData;
                            const location = geoIp.lookup(latestClientIp);
                            const {
                                ll: [latitude = 0, longitude = 0] = [],
                                city = '',
                                country = '',
                                region = '',
                            } = location || {};
                            const shouldIndexGeoInRedis = location && latitude && longitude;
                            userData = { ...userData, location };
                            const promises = [
                                manageSessionData({
                                    redisClient,
                                    hashedSessionId,
                                    userId,
                                    city,
                                    country,
                                    region,
                                }),
                                shouldIndexGeoInRedis &&
                                    indexGeoInRedis({ redisClient, latitude, longitude, userId }),
                            ].filter(Boolean) as Promise<void>[];
                            await Promise.all(promises);
                            break;
                        }
                        case 'user-register': {
                            let userData = parsedValue;
                            const { latestClientIp, hashedSessionId, userId } = userData;
                            const location = geoIp.lookup(latestClientIp);
                            const {
                                ll: [latitude = 0, longitude = 0] = [],
                                city = '',
                                country = '',
                                region = '',
                            } = location || {};
                            const shouldIndexGeoInRedis = location && latitude && longitude;
                            userData = { ...userData, location };
                            await Promise.all(
                                [
                                    elasticClient.index({
                                        index: 'test',
                                        id: userId,
                                        body: {
                                            ...userData,
                                        },
                                    }),
                                    manageSessionData({
                                        redisClient,
                                        hashedSessionId,
                                        userId,
                                        city,
                                        country,
                                        region,
                                    }),
                                    shouldIndexGeoInRedis &&
                                        indexGeoInRedis({
                                            redisClient,
                                            latitude,
                                            longitude,
                                            userId,
                                        }),
                                ].filter(Boolean) as Promise<any>[]
                            );
                            break;
                        }
                        case 'session-refresh': {
                            const { latestClientIp, hashedSessionId } = parsedValue;
                            const location = geoIp.lookup(latestClientIp);
                            const {
                                ll: [latitude = 0, longitude = 0] = [],
                                city = '',
                                country = '',
                                region = '',
                            } = location || {};
                            await Promise.all([
                                refreshSessionExpire({
                                    redisClient,
                                    longitude,
                                    latitude,
                                    hashedSessionId,
                                    city,
                                    country,
                                    region,
                                }),
                                redisClient.expireAsync(
                                    `session:${hashedSessionId}`,
                                    SESSION_EXPIRE_IN_S
                                ),
                            ]);
                            break;
                        }
                        case 'tweet-create': {
                            await indexTweetData(elasticClient, parsedValue);
                            break;
                        }
                        case 'tweet-update': {
                            await indexTweetData(elasticClient, parsedValue);
                            break;
                        }
                        case 'tweet-delete': {
                            const { tweetId }: { tweetId: string } = parsedValue;
                            await elasticClient.delete({
                                index: 'tweets',
                                id: tweetId,
                            });
                            break;
                        }
                        case 'hashtag-create': {
                            const {
                                hashtag,
                                createdBy,
                                category,
                                createdByUserName,
                                description,
                                followersCount,
                                createdAt,
                                updatedAt,
                            }: {
                                createdByUserName: string;
                                description: string;
                                category: string;
                                followersCount: number;
                                createdAt: string;
                                updatedAt: string;
                                createdBy: string;
                                hashtag: string;
                            } = parsedValue;
                            await elasticClient.index({
                                index: 'hashtags',
                                id: hashtag,
                                body: {
                                    hashtag,
                                    createdAt,
                                    createdBy,
                                    updatedAt,
                                    category,
                                    description,
                                    followersCount,
                                    createdByUserName,
                                },
                            });
                            break;
                        }
                        case 'hashtag-update': {
                            const {
                                hashtag,
                                createdBy,
                                category,
                                createdByUserName,
                                description,
                                followersCount,
                                createdAt,
                                updatedAt,
                            }: {
                                createdByUserName: string;
                                description: string;
                                category: string;
                                followersCount: number;
                                createdAt: string;
                                updatedAt: string;
                                createdBy: string;
                                hashtag: string;
                            } = parsedValue;
                            await elasticClient.index({
                                index: 'hashtags',
                                id: hashtag,
                                body: {
                                    hashtag,
                                    createdAt,
                                    createdBy,
                                    updatedAt,
                                    category,
                                    description,
                                    followersCount,
                                    createdByUserName,
                                },
                            });
                            break;
                        }
                        default:
                            break;
                    }
                },
            });
            break;
        } catch (err) {
            console.error(err);
            retries -= 1;
            console.log(`Retries left: ${retries}, retrying in 5 seconds.`);
            // wait 5 seconds
            // eslint-disable-next-line no-await-in-loop
            await new Promise((res) => setTimeout(res, 5000));
        }
    }
};

initializeConsumption();
