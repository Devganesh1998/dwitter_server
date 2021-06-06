import { Kafka, Producer } from 'kafkajs';

const kafkaClient = new Kafka({
	clientId: 'dwitter-server',
	brokers: ['kafka:9092'],
});

const kfProducer: Producer = kafkaClient.producer();

(async function initializeKfConnection() {
	try {
		await kfProducer.connect();
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
	}
})();

export default kfProducer;
