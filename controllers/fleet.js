const { consumeQueue } = require('../utils/rabbitMQConnection');

function fleetController(io) {
	consumeQueue({ queueName: 'location' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('location', data);
	});
	consumeQueue({ queueName: 'car_speed' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('car_speed', data);
	});
	consumeQueue({ queueName: 'heartbeat' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('heartbeat', data);
	});
}

module.exports = {
	fleetController,
};
