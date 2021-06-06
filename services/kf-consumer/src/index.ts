import { Kafka, Producer } from 'kafkajs';

const kafkaClient = new Kafka({
	clientId: 'dwitter-server',
	brokers: ['kafka:9092'],
});
