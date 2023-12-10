const mongoose = require('mongoose');
const RSU = require('../models/RSU');

//@desc     Get all RSUs
//@route    PUT /api/rsus
//@access   Public
exports.getRSUs = async (req, res, next) => {
	try {
		const rsus = await RSU.aggregate([
			{
				$addFields: {
					tempId: { $toString: '$_id' },
				},
			},
			{
				$match: {
					tempId: { $regex: req.body.id ?? '', $options: 'i' },
					name: {
						$regex: req.body.name ?? '',
						$options: 'i',
					},
					recommended_speed: {
						$regex: req.body.recommended_speed ?? '',
						$options: 'i',
					},
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					recommended_speed: 1,
				},
			},
			{
				$sort: { name: 1 },
			},
		]);

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
			{
				$sort: {
					name: 1,
				},
			},
		]);

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
				},
			},
		]);

		if (rsu.length === 0) {
			return res
				.status(400)
				.json({ success: false, error: 'the RSU not found' });
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
		const rsu = await RSU.create(req.body);

		return res.status(201).json({
			success: true,
			data: {
				id: rsu._id,
				name: rsu.name,
				recommended_speed: rsu.recommended_speed,
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
		const rsu = await RSU.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!rsu) {
			return res
				.status(400)
				.json({ success: false, error: 'the RSU not found' });
		}

		return res.status(200).json({
			success: true,
			data: {
				id: rsu._id,
				name: rsu.name,
				recommended_speed: rsu.recommended_speed,
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
				.status(400)
				.json({ success: false, error: 'the RSU not found' });
		}

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
