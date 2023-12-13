const mongoose = require('mongoose');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const { noSpaceRegex, passwordRegex, phoneNoRegex } = require('../utils/regex');

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

		if (driver.length === 0) {
			return res
				.status(404)
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
		const { first_name, last_name, username, password, phone_no } = req.body;

		if (!first_name) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a first_name' });
		}

		if (!last_name) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a last_name' });
		}

		if (!username) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a username' });
		}

		if (!password) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a password' });
		}

		if (!phone_no) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a phone_no' });
		}

		if (!noSpaceRegex.test(first_name)) {
			return res.status(400).json({
				success: false,
				error: 'First name should not contain spaces',
			});
		}

		if (!noSpaceRegex.test(last_name)) {
			return res.status(400).json({
				success: false,
				error: 'Last name should not contain spaces',
			});
		}

		const existingNameDriver = await Driver.findOne({
			first_name: first_name,
			last_name: last_name,
		});
		if (existingNameDriver) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		if (!noSpaceRegex.test(username)) {
			return res.status(400).json({
				success: false,
				error: 'Username should not contain spaces',
			});
		}

		const existingUsernameDriver = await Driver.findOne({
			username: username,
		});
		if (existingUsernameDriver) {
			return res.status(400).json({
				success: false,
				error: 'Username already exists',
			});
		}

		if (!passwordRegex.test(password)) {
			return res.status(400).json({
				success: false,
				error:
					'Password should not contain spaces and should be at least 8 characters',
			});
		}

		if (!phoneNoRegex.test(phone_no)) {
			return res.status(400).json({
				success: false,
				error: 'Phone Number should be xxx-xxx-xxxx format',
			});
		}

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
		const { first_name, last_name, username, password, phone_no } = req.body;

		if (first_name && !noSpaceRegex.test(first_name)) {
			return res.status(400).json({
				success: false,
				error: 'First name should not contain spaces',
			});
		}

		if (last_name && !noSpaceRegex.test(last_name)) {
			return res.status(400).json({
				success: false,
				error: 'Last name should not contain spaces',
			});
		}

		const existingNameDriver = await Driver.findOne({
			first_name: first_name ?? '',
			last_name: last_name ?? '',
		});
		if (existingNameDriver) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		if (username && !noSpaceRegex.test(username)) {
			return res.status(400).json({
				success: false,
				error: 'Username should not contain spaces',
			});
		}

		const existingUsernameDriver = await Driver.findOne({
			username: username ?? '',
		});
		if (existingUsernameDriver) {
			return res.status(400).json({
				success: false,
				error: 'Username already exists',
			});
		}

		if (password && !passwordRegex.test(password)) {
			return res.status(400).json({
				success: false,
				error:
					'Password should not contain spaces and should be at least 8 characters',
			});
		}

		if (phone_no && !phoneNoRegex.test(phone_no)) {
			return res.status(400).json({
				success: false,
				error: 'Phone Number should be xxx-xxx-xxxx format',
			});
		}

		const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!driver) {
			return res
				.status(404)
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
				.status(404)
				.json({ success: false, error: 'the driver not found' });
		}

		await Car.updateMany(
			{ driver_id: new mongoose.Types.ObjectId(req.params.id) },
			{ $set: { driver_id: null } }
		);

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
