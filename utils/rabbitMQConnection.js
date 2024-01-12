const amqp = require('amqplib');

async function publishToQueue(queueName, data) {
	try {
		if (!process.env.RABBITMQ_HOST) {
			throw new Error('RABBITMQ_HOST is required');
		}
		const connection = await amqp.connect(process.env.RABBITMQ_HOST);
		const channel = await connection.createChannel();
		await channel.assertQueue(queueName, true);
		channel.sendToQueue(queueName, Buffer.from(data));
	} catch (error) {
		throw new Error(`Error publishing to queue: ${error.message}`);
	}
}

module.exports = { publishToQueue };
