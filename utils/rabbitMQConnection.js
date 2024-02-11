const amqp = require('amqplib');

let connection;
const exchange = 'direct_logs';

async function connectRabbitMQ() {
	if (!process.env.RABBITMQ_HOST) {
		throw new Error('RABBITMQ_URL env is undefined');
	}
	connection = await amqp.connect(process.env.RABBITMQ_HOST);
	connection.on('error', (err) => {
		console.error('RabbitMQ connection', err);
	});
}

async function publishToQueue(queueName, data) {
	try {
		const channel = await connection.createChannel();
		channel.on('error', (err) => {
			console.error('RabbitMQ channel', err);
		});
		await channel.assertQueue(queueName, true);
		channel.sendToQueue(queueName, Buffer.from(data));
	} catch (error) {
		throw new Error(`Error publishing to queue: ${error.message}`);
	}
}

async function consumeQueue(
	{ queueName, routingKey = [], durable = false, noAck = true },
	callback
) {
	try {
		const channel = await connection.createChannel();
		await channel.assertQueue(queueName, { durable: durable });
		routingKey.forEach(async (key) => {
			await channel.bindQueue(queueName, exchange, key);
		});
		channel.consume(
			queueName,
			(msg) => {
				callback(msg);
				if (!noAck) {
					channel.ack(msg);
				}
			},
			{ noAck: noAck }
		);
	} catch (error) {
		throw new Error(`consuming queue - ${error.message} ${error}`);
	}
}

module.exports = { connectRabbitMQ, publishToQueue, consumeQueue };
