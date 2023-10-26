const mongoose = require('mongoose');
const Driver = require('../models/Driver');

//@desc     Get all drivers
//@route    PUT /api/drivers
//@access   Public
exports.getDrivers = async (req, res, next) => {
	try {
		const drivers = await Driver.aggregate([
			{
				$addFields: {
					tempId: { $toString: '$_id' },
				},
			},
			{
				$match: {
					tempId: { $regex: req.body.id ?? '', $options: 'i' },
					first_name: {
						$regex: req.body.first_name ?? '',
						$options: 'i',
					},
					last_name: {
						$regex: req.body.last_name ?? '',
						$options: 'i',
					},
					phone_no: {
						$regex: req.body.phone_no ?? '',
						$options: 'i',
					},
					username: {
						$regex: req.body.username ?? '',
						$options: 'i',
					},
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
					first_name: 1,
					last_name: 1,
					phone_no: 1,
					username: 1,
				},
			},
		]).sort({ first_name: 1, last_name: 1 });

		return res
			.status(200)
			.json({ success: true, count: drivers.length, data: drivers });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get all drivers list
//@route    GET /api/drivers/list
//@access   Public
exports.getDriversList = async (req, res, next) => {
	try {
		const drivers = await Driver.aggregate([
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
				},
			},
		]).sort({ name: 1 });

		return res
			.status(200)
			.json({ success: true, count: drivers.length, data: drivers });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get single driver
//@route    GET /api/drivers/:id
//@access   Public
exports.getDriver = async (req, res, next) => {
	try {
		const driver = await Driver.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(req.params.id) },
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
					first_name: 1,
					last_name: 1,
					phone_no: 1,
					username: 1,
				},
			},
		]);

		if (driver === 0) {
			return res
				.status(400)
				.json({ success: false, error: 'the driver not found' });
		}

		return res.status(200).json({ success: true, data: driver[0] });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Create new driver
//@route    POST /api/drivers
//@access   Public
exports.createDriver = async (req, res, next) => {
	try {
		const driver = await Driver.create(req.body);

		return res.status(201).json({
			success: true,
			data: {
				id: driver._id,
				name: `${driver.first_name} ${driver.last_name}`,
				first_name: driver.first_name,
				last_name: driver.last_name,
				phone_no: driver.phone_no,
				username: driver.username,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Update driver
//@route    PUT /api/drivers/:id
//@access   Public
exports.updateDriver = async (req, res, next) => {
	try {
		const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!driver) {
			return res
				.status(400)
				.json({ success: false, error: 'the driver not found' });
		}

		return res.status(200).json({
			success: true,
			data: {
				id: driver._id,
				name: `${driver.first_name} ${driver.last_name}`,
				first_name: driver.first_name,
				last_name: driver.last_name,
				phone_no: driver.phone_no,
				username: driver.username,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Delete driver
//@route    DELETE /api/drivers/:id
//@access   Public
exports.deleteDriver = async (req, res, next) => {
	try {
		const driver = await Driver.findByIdAndDelete(req.params.id);

		if (!driver) {
			return res
				.status(400)
				.json({ success: false, error: 'the driver not found' });
		}

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
