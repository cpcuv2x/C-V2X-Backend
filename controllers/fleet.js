const {
	consumeQueue,
	publishToQueue,
} = require('../config/rabbitMQConnection');
const { reportRegex } = require('../utils/regex');
const Report = require('../models/Report');
const RSU = require('../models/RSU');
const mongoose = require('mongoose');

function consumeLocation(io) {
	consumeQueue({ queueName: 'location' }, async (msg) => {
		const data = JSON.parse(msg.content.toString());
		const { id, type, latitude, longitude } = data;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return console.log('Fail consuming location: Invalid id', id);
		}
		io.emit('location', data);

		if (type === 'RSU') {
			const rsu = await RSU.findById(id);
			if (
				rsu &&
				latitude &&
				longitude &&
				(rsu.latitude.toString() !== latitude.toString() ||
					rsu.longitude.toString() !== longitude.toString())
			) {
				await RSU.findByIdAndUpdate(
					id,
					{
						latitude: latitude.toString(),
						longitude: longitude.toString(),
					},
					{
						new: true,
						runValidators: true,
					}
				);
			}
		}
	});
}

function consumeHeartbeat(io) {
	consumeQueue({ queueName: 'heartbeat' }, async (msg) => {
		const data = JSON.parse(msg.content.toString());
		const { id, type } = data;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return console.log('Fail consuming heartbeat: Invalid id', id);
		}
		io.emit('heartbeat', data);

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

			const rsu = await RSU.findOne({ _id: new mongoose.Types.ObjectId(id) });
			if (rsu) {
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
		}
	});
}

async function fleetController(io) {
	consumeLocation(io);
	consumeHeartbeat(io);

	consumeQueue({ queueName: 'car_speed' }, (msg) => {
		const data = JSON.parse(msg.content.toString());
		io.emit('car_speed', data);
	});

	consumeQueue({ queueName: 'new_report' }, async (msg) => {
		try {
			const data = JSON.parse(msg.content.toString());
			const failMessagePrefix = 'Fail creating new report:';
			const { type, rsu_id, latitude, longitude } = data;

			if (!type) return console.log(failMessagePrefix, 'Please add a type');
			if (!rsu_id) return console.log(failMessagePrefix, 'Please add a rsu_id');
			if (!latitude)
				return console.log(failMessagePrefix, 'Please add a latitude');
			if (!longitude)
				return console.log(failMessagePrefix, 'Please add a longitude');
			if (!reportRegex.test(type))
				return console.log(
					failMessagePrefix,
					"Type should be 'ACCIDENT', 'CLOSED ROAD', 'CONSTRUCTION', or 'TRAFFIC CONGESTION'"
				);
			if (!mongoose.Types.ObjectId.isValid(rsu_id)) {
				return console.log(failMessagePrefix, 'Invalid rsu_id', rsu_id);
			}

			const rsu = await RSU.findById(rsu_id);
			if (!rsu) return console.log(failMessagePrefix, 'RSU not found');
			if (typeof latitude !== 'number')
				return console.log(failMessagePrefix, 'Latitude must be a number');
			if (typeof longitude !== 'number')
				return console.log(failMessagePrefix, 'Longitude must be a number');

			const report = {
				type: type,
				rsu_id: rsu_id,
				latitude: latitude,
				longitude: longitude,
			};
			await Report.create(report);
			console.log('Successfully add a report:', report);
		} catch (error) {
			throw new Error('Error creating new report:', error.message);
		}
	});
}

module.exports = {
	fleetController,
};
