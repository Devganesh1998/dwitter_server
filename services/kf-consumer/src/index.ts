/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import { Kafka, Consumer } from 'kafkajs';
import geoIp from 'geoip-lite';
import { Client } from '@elastic/elasticsearch';
import { getRedisClient, manageSessionData, indexGeoInRedis } from './utils';

dotenv.config();

// const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
// const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';

const kafkaClient = new Kafka({
    clientId: 'dwitter-consumer',
    brokers: ['kafka:9092'],
});

const elasticClient = new Client({ node: 'http://elastic:9200' });

const consumer: Consumer = kafkaClient.consumer({ groupId: 'user' });

const initializeConsumption = async () => {
    const redisClient = getRedisClient();
    let retries = 5;
    while (retries) {
        try {
            await consumer.connect();
            await Promise.all([
                consumer.subscribe({ topic: 'user-login', fromBeginning: true }),
                consumer.subscribe({ topic: 'user-register', fromBeginning: true }),
            ]);
            await consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const value = message?.value?.toString() || '';
                    let userData = JSON.parse(value) || {};
                    const { latestClientIp } = userData;
                    const location = geoIp.lookup(latestClientIp);
                    const {
                        ll: [latitude = 0, longitude = 0] = [],
                        city = '',
                        country = '',
                        region = '',
                    } = location || {};
                    const shouldIndexGeoInRedis = location && latitude && longitude;
                    userData = { ...userData, location };
                    switch (topic) {
                        case 'user-login': {
                            const { hashedSessionId, userId } = userData;
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
                            const { hashedSessionId, userId } = userData;
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
                                ].filter(Boolean) as Promise<void>[]
                            );
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
