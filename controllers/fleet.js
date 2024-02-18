const {
	consumeQueue,
	publishToQueue,
} = require('../config/rabbitMQConnection');
const Report = require('../models/Report');
const RSU = require('../models/RSU');

function fleetController(io) {
	consumeQueue({ queueName: 'location' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('location', data);
	});

	consumeQueue({ queueName: 'car_speed' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('car_speed', data);
	});

	consumeQueue({ queueName: 'heartbeat' }, async (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('heartbeat', data);
		const { id, type } = data;
		if (type === 'RSU') {
			const reports = await Report.find({ rsu_id: id });
			// publishToQueue('report', reports);

			const rsu = await RSU.findById(id);
			// publishToQueue('reccommended_speed', rsu.recommended_speed);
		}
	});

	consumeQueue({ queueName: 'new_report' }, async (msg) => {
		const data = JSON.parse(msg.content.toString());
		try {
			const { type, rsu_id, latitude, longitude } = data;

			if (!type)
				throw new Error('Error creating new report: Please add a type');
			if (!rsu_id)
				throw new Error('Error creating new report: Please add a rsu_id');
			if (!latitude)
				throw new Error('Error creating new report: Please add a latitude');
			if (!longitude)
				throw new Error('Error creating new report: Please add a longitude');
			const rsu = await RSU.findById(rsu_id);
			if (!rsu) throw new Error('Error creating new report: RSU not found');
			if (typeof latitude !== 'number')
				throw new Error('Error creating new report: Latitude must be a number');
			if (typeof longitude !== 'number')
				throw new Error(
					'Error creating new report: Longitude must be a number'
				);

			const report = {
				type: type,
				rsu_id: rsu_id,
				latitude: latitude,
				longitude: longitude,
			};
			await Report.create(report);
			console.log('Successfully add a report :', report);
		} catch (error) {
			throw new Error(`Error creating new report: ${error.message}`);
		}
	});
}

module.exports = {
	fleetController,
};
