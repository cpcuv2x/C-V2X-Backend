const mongoose = require('mongoose');
const Camera = require('../models/Camera');
const Car = require('../models/Car');

//@desc     Get all cameras
//@route    GET /api/cameras
//@access   Public
exports.getCameras = async (req, res, next) => {
	try {
		const cameras = await Camera.aggregate([
			{
				$lookup: {
					from: 'cars',
					localField: 'car_id',
					foreignField: '_id',
					as: 'carData',
				},
			},
			{
				$unwind: '$carData',
			},
			{
				$project: {
					id: '$_id',
					name: 1,
					position: 1,
					car_id: 1,
					car: '$carData.name',
				},
			},
		]);

		res
			.status(200)
			.json({ success: true, count: cameras.length, data: cameras });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get all cameras
//@route    GET /api/cameras/list
//@access   Public
exports.getCamerasList = async (req, res, next) => {
	try {
		const cameras = await Camera.aggregate([
			{
				$project: {
					id: '$_id',
					name: 1,
				},
			},
		]);

		res
			.status(200)
			.json({ success: true, count: cameras.length, data: cameras });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get single camera
//@route    GET /api/cameras/:id
//@access   Public
exports.getCamera = async (req, res, next) => {
	try {
		const camera = await Camera.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(req.params.id) },
			},
			{
				$lookup: {
					from: 'cars',
					localField: 'car_id',
					foreignField: '_id',
					as: 'carData',
				},
			},
			{
				$unwind: '$carData',
			},
			{
				$project: {
					id: '$_id',
					name: 1,
					position: 1,
					car_id: 1,
					car: '$carData.name',
				},
			},
		]);

		if (!camera) {
			res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: camera });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new camera
//@route    POST /api/cameras
//@access   Public
exports.createCamera = async (req, res, next) => {
	const car = await Car.exists({
		_id: new mongoose.Types.ObjectId(req.body.car_id),
	});
	if (!car) {
		res.status(400).json({ success: false });
	} else {
		const camera = await Camera.create(req.body);
		res.status(201).json({ success: true, data: camera });
	}
};

//@desc     Update camera
//@route    PUT /api/cameras/:id
//@access   Public
exports.updateCamera = async (req, res, next) => {
	try {
		const car = await Car.exists({
			_id: new mongoose.Types.ObjectId(req.body.car_id),
		});
		if (!car) {
			res.status(400).json({ success: false });
		} else {
			const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});

			if (!camera) {
				res.status(400).json({ success: false });
			}

			res.status(200).json({ success: true, data: camera });
		}
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete camera
//@route    DELETE /api/cameras/:id
//@access   Public
exports.deleteCamera = async (req, res, next) => {
	try {
		const camera = await Camera.findByIdAndDelete(req.params.id);

		if (!camera) {
			res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
