const {
	consumeQueue,
	publishToQueue,
} = require('../config/rabbitMQConnection');
const Report = require('../models/Report');
const RSU = require('../models/RSU');
const mongoose = require('mongoose');

async function fleetController(io) {
	consumeQueue({ queueName: 'location' }, async (msg) => {
		const data = JSON.parse(msg.content.toString());
		if (data.type === 'RSU') {
			const rsu = await RSU.findById(data.id);
			if (
				rsu.latitude.toString() !== data.latitude.toString() ||
				rsu.longitude.toString() !== data.longitude.toString()
			) {
				await RSU.findByIdAndUpdate(
					data.id,
					{
						latitude: data.latitude.toString(),
						longitude: data.longitude.toString(),
					},
					{
						new: true,
						runValidators: true,
					}
				);
			}
		}
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
			const reports = await Report.aggregate([
				{
					$match: { rsu_id: new mongoose.Types.ObjectId(id) },
				},
				{
					$project: {
						_id: 0,
						rsu_id: 1,
						type: 1,
						latitude: 1,
						longitude: 1,
						timestamp: '$createdAt',
					},
				},
			]);
			if (reports && reports.length > 0) {
				publishToQueue(`reports_${id}`, JSON.stringify(reports));
			}

			const rsu = await RSU.findById(id);
			publishToQueue(
				`rec_speed_${id}`,
				JSON.stringify({
					rsu_id: id,
					recommend_speed: parseFloat(rsu.recommended_speed),
					unit: 'km/h',
					timestamp: new Date(),
				})
			);
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
			if (!reportRegex.test(type))
				throw new Error(
					"Error creating new report: Type should be 'ACCIDENT', 'CLOSED ROAD', 'CONSTRUCTION', or 'TRAFFIC CONGESTION'"
				);
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
