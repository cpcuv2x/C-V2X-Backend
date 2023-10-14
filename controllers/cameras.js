const mongoose = require('mongoose');
const Camera = require('../models/Camera');
const Car = require('../models/Car');

//@desc     Get all cameras
//@route    PUT /api/cameras
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
					position: {
						$regex: req.body.position ?? '',
						$options: 'i',
					},
					'carData.name': {
						$regex: req.body.car ?? '',
						$options: 'i',
					},
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					position: 1,
					car_id: 1,
					car: '$carData.name',
				},
			},
		]);

		return res
			.status(200)
			.json({ success: true, count: cameras.length, data: cameras });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get all cameras
//@route    GET /api/cameras/list
//@access   Public
exports.getCamerasList = async (req, res, next) => {
	try {
		const cameras = await Camera.find({}, { _id: 0, id: '$_id', name: 1 });

		return res
			.status(200)
			.json({ success: true, count: cameras.length, data: cameras });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
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
					_id: 0,
					id: '$_id',
					name: 1,
					position: 1,
					car_id: 1,
					car: '$carData.name',
				},
			},
		]);

		if (camera.length === 0) {
			return res
				.status(400)
				.json({ success: false, error: 'the camera not found' });
		}

		return res.status(200).json({ success: true, data: camera[0] });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Create new camera
//@route    POST /api/cameras
//@access   Public
exports.createCamera = async (req, res, next) => {
	try {
		const carExists = await Car.exists({
			_id: new mongoose.Types.ObjectId(req.body.car_id),
		});

		if (!carExists) {
			return res
				.status(400)
				.json({ success: false, error: 'the car not found' });
		}

		const camera = await Camera.create(req.body);
		return res.status(201).json({ success: true, data: camera });
	} catch (err) {
		return res.status(500).json({ success: false, error: err.message });
	}
};

//@desc     Update camera
//@route    PUT /api/cameras/:id
//@access   Public
exports.updateCamera = async (req, res, next) => {
	try {
		const carExists = await Car.exists({
			_id: new mongoose.Types.ObjectId(req.body.car_id),
		});

		if (!carExists) {
			return res
				.status(400)
				.json({ success: false, error: 'the car not found' });
		}

		const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!camera) {
			return res
				.status(400)
				.json({ success: false, error: 'the camera not found' });
		}

		return res.status(200).json({ success: true, data: camera });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Delete camera
//@route    DELETE /api/cameras/:id
//@access   Public
exports.deleteCamera = async (req, res, next) => {
	try {
		const camera = await Camera.findByIdAndDelete(req.params.id);

		if (!camera) {
			return res
				.status(400)
				.json({ success: false, error: 'the camera not found' });
		}

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
