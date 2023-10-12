const mongoose = require('mongoose');
const RSU = require('../models/RSU');

//@desc     Get all RSUs
//@route    GET /api/rsus
//@access   Public
exports.getRSUs = async (req, res, next) => {
	try {
		const rsus = await RSU.aggregate([
			{
				$project: {
					id: '$_id',
					name: 1,
					recommended_speed: 1,
				},
			},
		]);

		res.status(200).json({ success: true, count: rsus.length, data: rsus });
	} catch (err) {
		res.status(400).json({ success: false });
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
					id: '$_id',
					name: 1,
				},
			},
		]);

		res
			.status(200)
			.json({ success: true, count: rsus.length, data: mapped_rsus });
	} catch (err) {
		res.status(400).json({ success: false });
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
					id: '$_id',
					name: 1,
					recommended_speed: 1,
				},
			},
		]);

		if (!rsu) {
			res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: mapped_rsu });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new RSU
//@route    POST /api/rsus
//@access   Public
exports.createRSU = async (req, res, next) => {
	const rsu = await RSU.create(req.body);
	const mapped_rsu = {
		id: rsu._id,
		name: rsu.name,
		recommended_speed: rsu.recommended_speed,
	};
	res.status(201).json({ success: true, data: mapped_rsu });
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
			res.status(400).json({ success: false });
		}
		const mapped_rsu = {
			id: rsu._id,
			name: rsu.name,
			recommended_speed: rsu.recommended_speed,
		};
		res.status(200).json({ success: true, data: mapped_rsu });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete RSU
//@route    DELETE /api/rsus/:id
//@access   Public
exports.deleteRSU = async (req, res, next) => {
	try {
		const rsu = await RSU.findByIdAndDelete(req.params.id);

		if (!rsu) {
			res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
