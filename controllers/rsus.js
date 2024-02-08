const mongoose = require('mongoose');
const RSU = require('../models/RSU');
const { noSpaceRegex, numberRegex, floatRegex } = require('../utils/regex');

//@desc     Get all RSUs
//@route    PUT /api/rsus
//@access   Public
exports.getRSUs = async (req, res, next) => {
	try {
		const filter = {};

		if (req.body.id) {
			filter.tempId = { $regex: req.body.id, $options: 'i' };
		}
		if (req.body.name) {
			filter.name = { $regex: req.body.name, $options: 'i' };
		}
		if (req.body.recommended_speed) {
			filter.recommended_speed = {
				$regex: req.body.recommended_speed,
				$options: 'i',
			};
		}
		if (req.body.latitude) {
			filter.latitude = { $regex: req.body.latitude, $options: 'i' };
		}
		if (req.body.longitude) {
			filter.longitude = { $regex: req.body.longitude, $options: 'i' };
		}

		const rsus = await RSU.aggregate([
			{
				$addFields: {
					tempId: { $toString: '$_id' },
				},
			},
			{
				$match: filter,
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					recommended_speed: 1,
					latitude: 1,
					longitude: 1,
				},
			},
		]).sort({ name: 1 });

		return res
			.status(200)
			.json({ success: true, count: rsus.length, data: rsus });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get all RSUs list
//@route    GET /api/rsus/list
//@access   Public
exports.getRSUsList = async (req, res, next) => {
	try {
		const rsus = await RSU.aggregate([
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
				},
			},
		]).sort({ name: 1 });

		return res
			.status(200)
			.json({ success: true, count: rsus.length, data: rsus });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get single RSU
//@route    GET /api/rsus/:id
//@access   Public
exports.getRSU = async (req, res, next) => {
	try {
		const rsu = await RSU.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(req.params.id) },
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					recommended_speed: 1,
					latitude: 1,
					longitude: 1,
				},
			},
		]);

		if (rsu.length === 0) {
			return res
				.status(404)
				.json({ success: false, error: 'The RSU not found' });
		}

		return res.status(200).json({ success: true, data: rsu[0] });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Create new RSU
//@route    POST /api/rsus
//@access   Public
exports.createRSU = async (req, res, next) => {
	try {
		const { name, recommended_speed, latitude, longitude } = req.body;

		if (!name) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a name' });
		}

		if (!recommended_speed) {
			return res.status(400).json({
				success: false,
				error: 'Please add a recommended speed',
			});
		}

		if (!latitude) {
			return res.status(400).json({
				success: false,
				error: 'Please add a latitude',
			});
		}

		if (!longitude) {
			return res.status(400).json({
				success: false,
				error: 'Please add a longitude',
			});
		}

		if (!noSpaceRegex.test(name)) {
			return res
				.status(400)
				.json({ success: false, error: 'Name should not contain spaces' });
		}

		if (!numberRegex.test(recommended_speed)) {
			return res.status(400).json({
				success: false,
				error: 'Recommended speed should be a valid number',
			});
		}

		if (!floatRegex.test(latitude)) {
			return res.status(400).json({
				success: false,
				error: 'Latitude should be a coordinate number',
			});
		}

		if (!floatRegex.test(longitude)) {
			return res.status(400).json({
				success: false,
				error: 'Longitude should be a coordinate number',
			});
		}

		const existingRSU = await RSU.findOne({ name });
		if (existingRSU) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		const rsu = await RSU.create(req.body);

		return res.status(201).json({
			success: true,
			data: {
				id: rsu._id,
				name: rsu.name,
				recommended_speed: rsu.recommended_speed,
				latitude: rsu.latitude,
				longitude: rsu.longitude,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Update RSU
//@route    PUT /api/rsus/:id
//@access   Public
exports.updateRSU = async (req, res, next) => {
	try {
		const { name, recommended_speed, latitude, longitude } = req.body;

		if (name && !noSpaceRegex.test(name)) {
			return res
				.status(400)
				.json({ success: false, error: 'Name should not contain spaces' });
		}

		if (recommended_speed && !numberRegex.test(recommended_speed)) {
			return res.status(400).json({
				success: false,
				error: 'Recommended speed should be a valid number',
			});
		}

		if (latitude && !floatRegex.test(latitude)) {
			return res.status(400).json({
				success: false,
				error: 'Latitude should be a coordinate number',
			});
		}

		if (longitude && !floatRegex.test(longitude)) {
			return res.status(400).json({
				success: false,
				error: 'Longitude should be a coordinate number',
			});
		}

		const existingRSU = await RSU.findOne({ name: name });
		if (existingRSU && existingRSU._id.toString() !== req.params.id) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		const rsu = await RSU.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!rsu) {
			return res
				.status(404)
				.json({ success: false, error: 'The RSU not found' });
		}

		return res.status(200).json({
			success: true,
			data: {
				id: rsu._id,
				name: name ?? rsu.name,
				recommended_speed: recommended_speed ?? rsu.recommended_speed,
				latitude: latitude ?? rsu.latitude,
				longitude: longitude ?? rsu.longitude,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Delete RSU
//@route    DELETE /api/rsus/:id
//@access   Public
exports.deleteRSU = async (req, res, next) => {
	try {
		const rsu = await RSU.findByIdAndDelete(req.params.id);

		if (!rsu) {
			return res
				.status(404)
				.json({ success: false, error: 'The RSU not found' });
		}

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
