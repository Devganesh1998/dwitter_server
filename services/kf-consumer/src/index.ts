/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import { Kafka, Consumer } from 'kafkajs';
import { Client } from '@elastic/elasticsearch';
import getRedisClient from './utils';
import { SESSION_EXPIRE_IN_S } from './config';
import { CustomRedisClient } from '../types';

dotenv.config();

// const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
// const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';

const kafkaClient = new Kafka({
    clientId: 'dwitter-consumer',
    brokers: ['kafka:9092'],
});

const elasticClient = new Client({ node: 'http://elastic:9200' });

const consumer: Consumer = kafkaClient.consumer({ groupId: 'user' });

const manageSessionExpire = async ({
    redisClient,
    hashedSessionId,
    userId,
}: {
    redisClient: CustomRedisClient;
    hashedSessionId: string;
    userId: string;
}) => {
    await redisClient.saddAsync([`userSessions:${userId}`, `session:${hashedSessionId}`]);
    await Promise.all([
        redisClient.expireAsync(`userSessions:${userId}`, SESSION_EXPIRE_IN_S),
        redisClient.expireAsync(`session:${hashedSessionId}`, SESSION_EXPIRE_IN_S),
    ]);
};

const initializeConsumption = async () => {
    const redisClient = getRedisClient();
    let retries = 5;
    while (retries) {
        try {
            await consumer.connect();
            await consumer.subscribe({ topic: 'user-login', fromBeginning: true });
            await consumer.subscribe({ topic: 'user-register', fromBeginning: true });
            await consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const value = message?.value?.toString() || '';
                    const userData = JSON.parse(value) || {};
                    switch (topic) {
                        case 'user-login': {
                            const { hashedSessionId, userId } = userData;
                            await manageSessionExpire({ redisClient, hashedSessionId, userId });
                            break;
                        }
                        case 'user-register': {
                            const { hashedSessionId, userId } = userData;
                            await Promise.all([
                                elasticClient.index({
                                    index: 'test',
                                    id: userId,
                                    body: {
                                        ...userData,
                                    },
                                }),
                                manageSessionExpire({ redisClient, hashedSessionId, userId }),
                            ]);
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
