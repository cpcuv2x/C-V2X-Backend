const amqp = require('amqplib');

async function connectRabbitMQ() {
	if (!process.env.RABBITMQ_HOST) {
		throw new Error('RABBITMQ_URL env is undefined');
	}
	const connection = await amqp.connect(process.env.RABBITMQ_HOST);
	const channel = await connection.createChannel();
	return channel;
}

async function publishToQueue(queueName, data) {
	try {
		const channel = await connectRabbitMQ();
		await channel.assertQueue(queueName, true);
		channel.sendToQueue(queueName, Buffer.from(data));
	} catch (error) {
		throw new Error(`Error publishing to queue: ${error.message}`);
	}
}

async function consumeQueue({ queueName, durable = false }, callback) {
	try {
		const channel = await connectRabbitMQ();
		await channel.assertQueue(queueName, { durable: durable });
		channel.consume(
			queueName,
			(msg) => {
				callback(msg);
			},
			{ noAck: false }
		);
	} catch (error) {
		throw new Error(`Error consuming queue: ${error.message} ${error}`);
	}
}

module.exports = { publishToQueue, consumeQueue };
