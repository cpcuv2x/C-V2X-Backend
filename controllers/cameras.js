const mongoose = require('mongoose');
const Camera = require('../models/Camera');
const Car = require('../models/Car');
const { noSpaceRegex, positionRegex } = require('../utils/regex');

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
					tempCarId: { $toString: '$carData._id' },
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
					tempCarId: {
						$regex: req.body.car_id ?? '',
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
		]).sort({ name: 1 });

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
		const cameras = await Camera.find({}, { _id: 0, id: '$_id', name: 1 }).sort(
			{ name: 1 }
		);

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
				.status(404)
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
		const { name, position, car_id } = req.body;

		if (!name) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a name' });
		}

		if (!car_id) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a car_id' });
		}

		if (!position) {
			return res
				.status(400)
				.json({ success: false, error: 'Please add a position' });
		}

		if (!noSpaceRegex.test(name)) {
			return res.status(400).json({
				success: false,
				error: 'Name should not contain spaces',
			});
		}

		const nameExists = await Camera.findOne({
			name: name,
		});
		if (nameExists && nameExists._id.toString() !== req.params.id) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		const carExists = await Car.exists({
			_id: new mongoose.Types.ObjectId(car_id),
		});
		if (!carExists) {
			return res
				.status(404)
				.json({ success: false, error: 'the car not found' });
		}

		if (!positionRegex.test(position)) {
			return res.status(400).json({
				success: false,
				error: 'Position should be Front or Back',
			});
		}

		const positionExists = await Camera.findOne({
			position: position,
			car_id: car_id,
		});
		if (positionExists && positionExists._id.toString() !== req.params.id) {
			return res
				.status(400)
				.json({ success: false, error: 'Position of the car already exists' });
		}

		const camera = await Camera.create(req.body);

		return res.status(201).json({
			success: true,
			data: {
				id: camera.id,
				name: camera.name,
				position: camera.position,
				car_id: camera.car_id,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Update camera
//@route    PUT /api/cameras/:id
//@access   Public
exports.updateCamera = async (req, res, next) => {
	try {
		const { name, position, car_id } = req.body;

		if (name && !noSpaceRegex.test(name)) {
			return res.status(400).json({
				success: false,
				error: 'Name should not contain spaces',
			});
		}

		if (car_id) {
			const carExists = await Car.exists({
				_id: new mongoose.Types.ObjectId(req.body.car_id),
			});

			if (!carExists) {
				return res
					.status(404)
					.json({ success: false, error: 'the car not found' });
			}
		}

		if (position && !positionRegex.test(position)) {
			return res.status(400).json({
				success: false,
				error: 'Position should be Front or Back',
			});
		}

		const nameExists = await Camera.findOne({
			name: name,
		});
		if (nameExists) {
			return res.status(400).json({
				success: false,
				error: 'Name already exists',
			});
		}

		const positionExists = await Camera.findOne({
			position: position,
			car_id: car_id,
		});
		if (positionExists) {
			return res
				.status(400)
				.json({ success: false, error: 'Position of the car already exists' });
		}

		const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!camera) {
			return res
				.status(404)
				.json({ success: false, error: 'the camera not found' });
		}

		return res.status(200).json({
			success: true,
			data: {
				id: camera.id,
				name: name ?? camera.name,
				position: position ?? camera.position,
				car_id: car_id ?? camera.car_id,
			},
		});
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
				.status(404)
				.json({ success: false, error: 'the camera not found' });
		}

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
