/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import { Kafka, Consumer } from 'kafkajs';

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
            await consumer.connect();
            await consumer.subscribe({ topic: 'user-login', fromBeginning: true });
            await consumer.subscribe({ topic: 'user-register', fromBeginning: true });
            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    console.log({
                        partition,
                        offset: message.offset,
                        value: message?.value?.toString(),
                        topic,
                    });
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
