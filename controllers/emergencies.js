const mongoose = require('mongoose');
const { consumeQueue } = require('../config/rabbitMQConnection');
const Emergency = require('../models/Emergency');
const Logs = require('../models/Logs');
const Car = require('../models/Car');
const { emergencyRegex } = require('../utils/regex');

//@desc     Get all Emergencies
//@route    GET /api/emergencies
//@access   Public
exports.getEmergencies = async (req, res, next) => {
	try {
		const emergencies = await Emergency.aggregate([
			{
				$lookup: {
					from: 'cars',
					localField: 'car_id',
					foreignField: '_id',
					as: 'car_info',
				},
			},
			{
				$unwind: '$car_info',
			},
			{
				$lookup: {
					from: 'drivers',
					localField: 'car_info.driver_id',
					foreignField: '_id',
					as: 'driver_info',
				},
			},
			{
				$unwind: {
					path: '$driver_info',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$addFields: {
					createdAtLocal: {
						$add: ['$createdAt', 25200000], // 7 hours in milliseconds
					},
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					status: 1,
					car_id: '$car_info._id',
					car_name: '$car_info.name',
					driver_phone_no: {
						$ifNull: ['$driver_info.phone_no', ''],
					},
					time: {
						$concat: [
							{
								$dateToString: {
									date: '$createdAtLocal',
									format: '%H:%M',
								},
							},
							' ',
							{
								$cond: {
									if: { $gte: [{ $hour: '$createdAtLocal' }, 12] },
									then: 'pm',
									else: 'am',
								},
							},
						],
					},
				},
			},
		]).sort({ car_name: 1 });

		return res
			.status(200)
			.json({ success: true, count: emergencies.length, data: emergencies });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

exports.createEmergency = (socket) => {
	consumeQueue(
		{
			queueName: 'emergency',
			durable: true,
			noAck: false,
		},
		async (msg) => {
			const failMessagePrefix = 'Fail creating new emergency:';
			try {
				const { car_id, latitude, longitude } = JSON.parse(
					msg.content.toString()
				);

				if (!car_id) {
					return console.log(failMessagePrefix, 'Please add a car_id');
				}
				if (!mongoose.Types.ObjectId.isValid(car_id)) {
					return console.log(failMessagePrefix, 'Invalid car_id');
				}

				const carExists = await Car.exists({
					_id: new mongoose.Types.ObjectId(car_id),
				});
				if (!carExists) {
					return console.log(failMessagePrefix, 'The car not found');
				}

				if (!latitude) {
					return console.log(failMessagePrefix, 'Please add a latitude');
				}
				if (typeof latitude !== 'number') {
					return console.log(failMessagePrefix, 'Latitude should be number');
				}

				if (!longitude) {
					return console.log(failMessagePrefix, 'Please add a longitude');
				}
				if (typeof longitude !== 'number') {
					return console.log(failMessagePrefix, 'Longitude should be number');
				}

				const emergency = await Emergency.create({
					car_id,
					latitude,
					longitude,
				});
				const data = {
					id: emergency._id,
					car_id: emergency.car_id,
					status: emergency.status,
					latitude: emergency.latitude,
					longitude: emergency.longitude,
				};
				socket.emit('emergency', data);
			} catch (err) {
				console.log('Error creating new emergency:', err);
			}
		}
	);
};

exports.createEmergencyFromRabbitMQ = (socket) => {
	consumeQueue(
		{
			queueName: 'emergency',
			routingKey: ['emergency_obu'],
			durable: true,
			noAck: false,
		},
		async (msg) => {
			try {
				const { car_id, status, latitude, longitude } = JSON.parse(
					msg.content.toString()
				);
				if (!car_id) {
					throw new Error('Please add a car_id');
				}

				const carExists = await Car.exists({
					_id: new mongoose.Types.ObjectId(car_id),
				});

				if (!carExists) {
					throw new Error('The car not found');
				}

				if (status && !emergencyRegex.test(status)) {
					throw new Error('Status should be pending, inProgress or complete');
				}

				if (latitude && typeof latitude !== 'number') {
					throw new Error('Latitude should be number');
				}

				if (longitude && typeof longitude !== 'number') {
					throw new Error('Longitude should be number');
				}

				const emergency = await Emergency.create({
					car_id,
					status,
					latitude,
					longitude,
				});
				const data = {
					id: emergency._id,
					car_id: emergency.car_id,
					status: emergency.status,
					latitude: emergency.latitude,
					longitude: emergency.longitude,
				};
				socket.emit('emergency', data);
			} catch (err) {
				console.log('create Emergency from RabbitMQ: ', err);
			}
		}
	);
};

//@desc     Update emergency
//@route    PUT /api/emergencies/:id
//@access   Public
exports.updateEmergency = async (req, res, next) => {
	try {
		const { car_id, status, latitude, longitude } = req.body;

		if (car_id) {
			const carExists = await Car.exists({
				_id: new mongoose.Types.ObjectId(car_id),
			});

			if (!carExists) {
				return res
					.status(404)
					.json({ success: false, error: 'The car not found' });
			}
		}

		if (status && !emergencyRegex.test(status)) {
			return res.status(400).json({
				success: false,
				error: 'Status should be pending, inProgress or complete',
			});
		}

		if (latitude && typeof latitude !== 'number') {
			return res.status(400).json({
				success: false,
				error: 'Latitude should be number',
			});
		}

		if (longitude && typeof longitude !== 'number') {
			return res.status(400).json({
				success: false,
				error: 'Longitude should be number',
			});
		}

		const emergency = await Emergency.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!emergency) {
			return res
				.status(404)
				.json({ success: false, error: 'The emergency not found' });
		}
		const data = {
			id: emergency._id,
			car_id: emergency.car_id,
			status: emergency.status,
			latitude: emergency.latitude,
			longitude: emergency.longitude,
		};
		req.socket.emit('emergency', data);
		return res.status(200).json({
			success: true,
			data: data,
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

exports.setupEmergencyStop = (io) => {
	io.on('connection', (socket) => {
		socket.on('join', (car_id) => {
			socket.join(car_id)
		})

		socket.on('emergency_stop_req', async (car_id) => {
			socket.to(car_id).emit('emergency_stop_req', car_id)
			console.log('emergency stop to car id', car_id);
			Logs.create({
				car_id: car_id,
				type: 'emergency_stop_req',
			});
		});

		socket.on('emergency_stop_res', (message) => {
			const {car_id, success} = {...message}
			socket.to(car_id).emit('emergency_stop_res', message)
			console.log('emergency stop response from', car_id, success);
			Logs.create({
				car_id: car_id,
				type: 'emergency_stop_res',
			});
		});
	});
}