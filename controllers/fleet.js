const { consumeQueue } = require('../utils/rabbitMQConnection');

function fleetController(io) {
	consumeQueue(
		{ queueName: 'location', routingKey: ['location_rsu', 'location_obu'] },
		(msg) => {
			const data = JSON.parse(msg.content.toString());
			io.emit('location', data);
		}
	);
	consumeQueue({ queueName: 'car_speed', routingKey: ['speed_obu'] }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('car_speed', data);
	});
	consumeQueue(
		{ queueName: 'heartbeat', routingKey: ['heartbeat_rsu', 'heartbeat_obu'] },
		(msg) => {
			const data = JSON.parse(msg.content.toString());
			io.emit('heartbeat', data);
		}
	);
}

module.exports = {
	fleetController,
};
