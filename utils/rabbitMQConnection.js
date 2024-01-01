const amqp = require('amqplib');

let connection = null;
let channel = null;

async function publishToQueue(queueName, data) {
	try {
		if (!connection) {
			connection = await amqp.connect('amqp://localhost');
			console.log('Connection to RabbitMQ established');
		}
		if (!channel) {
			channel = await connection.createChannel();
			console.log('Channel created');
		}
		await channel.assertQueue(queueName, true);
		channel.sendToQueue(queueName, Buffer.from(data));
		console.log(`Message send to queue ${queueName}`);
	} catch (error) {
		throw new Error(`Error publishing to queue: ${error.message}`);
	}
}

module.exports = { publishToQueue };
