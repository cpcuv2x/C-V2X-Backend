const mongoose = require('mongoose');
const Emergency = require('../models/Emergency');
const Car = require('../models/Car');

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
				$unwind: '$driver_info',
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					status: 1,
					car_name: '$car_info.name',
					driver_phone_no: '$driver_info.phone_no',
					time: {
						$concat: [
							{
								$dateToString: {
									date: '$createdAt',
									format: '%H:%M',
								},
							},
							' ',
							{
								$cond: {
									if: { $gte: [{ $hour: '$createdAt' }, 12] },
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

//@desc     Create new emergency
//@route    POST /api/emergencies
//@access   Public
exports.createEmergency = async (req, res, next) => {
	try {
		const carExists = await Car.exists({
			_id: new mongoose.Types.ObjectId(req.body.car_id),
		});

		if (!carExists) {
			return res
				.status(400)
				.json({ success: false, error: 'the car not found' });
		}

		const emergency = await Emergency.create(req.body);
		return res.status(201).json({ success: true, data: emergency });
	} catch (err) {
		return res.status(500).json({ success: false, error: err.message });
	}
};

//@desc     Update emergency
//@route    PUT /api/emergencies/:id
//@access   Public
exports.updateEmergency = async (req, res, next) => {
	try {
		if (
			req.body.status !== 'pending' &&
			req.body.status !== 'inProgress' &&
			req.body.status !== 'complete'
		) {
			return res
				.status(400)
				.json({ success: false, error: 'the status not found' });
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
				.status(400)
				.json({ success: false, error: 'the emergency not found' });
		}

		return res.status(200).json({ success: true, data: emergency });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
