const mongoose = require('mongoose');
const Driver = require('../models/Driver');

//@desc     Get all drivers
//@route    GET /api/drivers
//@access   Public
exports.getDrivers = async (req, res, next) => {
	try {
		const drivers = await Driver.aggregate([
			{
				$project: {
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
					first_name: 1,
					last_name: 1,
					phone_no: 1,
					username: 1,
				},
			},
		]);
		res
			.status(200)
			.json({ success: true, count: drivers.length, data: drivers });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get all drivers
//@route    GET /api/drivers/list
//@access   Public
exports.getDriversList = async (req, res, next) => {
	try {
		const drivers = await Driver.aggregate([
			{
				$project: {
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
				},
			},
		]);
		res
			.status(200)
			.json({ success: true, count: drivers.length, data: drivers });
	} catch (err) {
		res.status(400).json({ success: false });
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
					id: '$_id',
					name: { $concat: ['$first_name', ' ', '$last_name'] },
					first_name: 1,
					last_name: 1,
					phone_no: 1,
					username: 1,
				},
			},
		]);

		if (!driver) {
			res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: driver });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new driver
//@route    POST /api/drivers
//@access   Public
exports.createDriver = async (req, res, next) => {
	const driver = await Driver.create(req.body);
	const mapped_driver = {
		id: driver._id,
		name: driver.first_name + ' ' + driver.last_name,
		first_name: driver.first_name,
		last_name: driver.last_name,
		phone_no: driver.phone_no,
		username: driver.username,
	};
	res.status(201).json({ success: true, data: mapped_driver });
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
			res.status(400).json({ success: false });
		}
		const mapped_driver = {
			id: driver._id,
			name: driver.first_name + ' ' + driver.last_name,
			first_name: driver.first_name,
			last_name: driver.last_name,
			phone_no: driver.phone_no,
			username: driver.username,
		};
		res.status(200).json({ success: true, data: mapped_driver });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete driver
//@route    DELETE /api/drivers/:id
//@access   Public
exports.deleteDriver = async (req, res, next) => {
	try {
		const driver = await Driver.findByIdAndDelete(req.params.id);

		if (!driver) {
			res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
