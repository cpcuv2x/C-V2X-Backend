const mongoose = require('mongoose');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const Camera = require('../models/Camera');
const { noSpaceRegex } = require('../utils/regex');
const Emergency = require('../models/Emergency');

//@desc     Get all cars
//@route    PUT /api/cars
//@access   Public
exports.getCars = async (req, res, next) => {
	try {
		const cars = await Car.aggregate([
			{
				$lookup: {
					from: 'drivers',
					localField: 'driver_id',
					foreignField: '_id',
					as: 'driverInfo',
				},
			},
			{
				$lookup: {
					from: 'cameras',
					localField: '_id',
					foreignField: 'car_id',
					as: 'cameras',
				},
			},
			{
				$addFields: {
					tempId: { $toString: '$_id' },
					tempDriverId: { $toString: { $arrayElemAt: ['$driverInfo._id', 0] } },
					tempFrontCamId: {
						$let: {
							vars: {
								frontCamera: {
									$arrayElemAt: [
										{
											$filter: {
												input: '$cameras',
												as: 'camera',
												cond: { $eq: ['$$camera.position', 'Front'] },
											},
										},
										0,
									],
								},
							},
							in: { $toString: { $ifNull: ['$$frontCamera._id', null] } },
						},
					},
					tempBackCamId: {
						$let: {
							vars: {
								backCamera: {
									$arrayElemAt: [
										{
											$filter: {
												input: '$cameras',
												as: 'camera',
												cond: { $eq: ['$$camera.position', 'Back'] },
											},
										},
										0,
									],
								},
							},
							in: { $toString: { $ifNull: ['$$backCamera._id', null] } },
						},
					},
				},
			},
			{
				$match: {
					tempId: { $regex: req.body.id ?? '', $options: 'i' },
					name: {
						$regex: req.body.name ?? '',
						$options: 'i',
					},
					license_plate: {
						$regex: req.body.license_plate ?? '',
						$options: 'i',
					},
					model: {
						$regex: req.body.model ?? '',
						$options: 'i',
					},
					$and: [
						{
							$or: [
								{
									tempDriverId:
										req.body.driver_id && req.body.driver_id.length !== 0
											? req.body.driver_id
											: null,
								},
								{
									tempDriverId: {
										$regex: req.body.driver_id ?? '',
										$options: 'i',
									},
								},
							],
						},
						{
							$or: [
								{
									tempFrontCamId:
										req.body.front_cam_id && req.body.front_cam_id.length !== 0
											? req.body.front_cam_id
											: null,
								},
								{
									tempFrontCamId: {
										$regex: req.body.front_cam_id ?? '',
										$options: 'i',
									},
								},
							],
						},
						{
							$or: [
								{
									tempBackCamId:
										req.body.back_cam_id && req.body.back_cam_id.length !== 0
											? req.body.back_cam_id
											: null,
								},
								{
									tempBackCamId: {
										$regex: req.body.back_cam_id ?? '',
										$options: 'i',
									},
								},
							],
						},
					],
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					license_plate: 1,
					model: 1,
					driver_id: 1,
					driver: {
						$concat: [
							{ $arrayElemAt: ['$driverInfo.first_name', 0] },
							' ',
							{ $arrayElemAt: ['$driverInfo.last_name', 0] },
						],
					},
					cameras: {
						$map: {
							input: '$cameras',
							as: 'camera',
							in: {
								id: '$$camera._id',
								name: '$$camera.name',
								position: '$$camera.position',
							},
						},
					},
				},
			},
		]).sort({ name: 1 });

		return res
			.status(200)
			.json({ success: true, count: cars.length, data: cars });
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get all cars list
//@route    GET /api/cars/list
//@access   Public
exports.getCarsList = async (req, res, next) => {
	try {
		const cars = await Car.find({}, { _id: 0, id: '$_id', name: 1 }).sort({
			name: 1,
		});

		return res
			.status(200)
			.json({ success: true, count: cars.length, data: cars });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Get single car
//@route    GET /api/cars/:id
//@access   Public
exports.getCar = async (req, res, next) => {
	try {
		const car = await Car.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(req.params.id) },
			},
			{
				$lookup: {
					from: 'drivers',
					localField: 'driver_id',
					foreignField: '_id',
					as: 'driverInfo',
				},
			},
			{
				$lookup: {
					from: 'cameras',
					localField: '_id',
					foreignField: 'car_id',
					as: 'cameras',
				},
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					name: 1,
					license_plate: 1,
					model: 1,
					driver_id: 1,
					driver: {
						$concat: [
							{ $arrayElemAt: ['$driverInfo.first_name', 0] },
							' ',
							{ $arrayElemAt: ['$driverInfo.last_name', 0] },
						],
					},
					cameras: {
						$map: {
							input: '$cameras',
							as: 'camera',
							in: {
								id: '$$camera._id',
								name: '$$camera.name',
								position: '$$camera.position',
							},
						},
					},
				},
			},
		]);

		if (car.length === 0) {
			return res
				.status(404)
				.json({ success: false, error: 'The car not found' });
		}

		return res.status(200).json({ success: true, data: car[0] });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Create new car
//@route    POST /api/cars
//@access   Public
exports.createCar = async (req, res, next) => {
	const { name, license_plate, model, driver_id } = req.body;

	if (!name) {
		return res.status(400).json({ success: false, error: 'Please add a name' });
	}

	if (!license_plate) {
		return res
			.status(400)
			.json({ success: false, error: 'Please add a license_plate' });
	}

	if (!model) {
		return res
			.status(400)
			.json({ success: false, error: 'Please add a model' });
	}

	if (!noSpaceRegex.test(name)) {
		return res.status(400).json({
			success: false,
			error: 'Name should not contain spaces',
		});
	}

	const nameExists = await Car.findOne({ name: name });
	if (nameExists) {
		return res
			.status(400)
			.json({ success: false, error: 'Name already exists' });
	}

	let carData;
	if (driver_id && driver_id.length !== 0) {
		const driverExists = await Driver.exists({
			_id: new mongoose.Types.ObjectId(driver_id),
		});

		if (!driverExists) {
			return res
				.status(404)
				.json({ success: false, error: 'The driver not found' });
		}

		carData = req.body;
	} else {
		carData = {
			name: req.body.name,
			license_plate: req.body.license_plate,
			model: req.body.model,
		};
	}

	try {
		const car = await Car.create(carData);

		return res.status(201).json({
			success: true,
			data: {
				id: car._id,
				name: car.name,
				license_plate: car.license_plate,
				model: car.model,
				driver_id: car.driver_id,
			},
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Update car
//@route    PUT /api/cars/:id
//@access   Public
exports.updateCar = async (req, res, next) => {
	const { name, license_plate, model, driver_id } = req.body;

	if (name && !noSpaceRegex.test(name)) {
		return res.status(400).json({
			success: false,
			error: 'Name should not contain spaces',
		});
	}

	const nameExists = await Car.findOne({ name: name });
	if (nameExists && nameExists._id.toString() !== req.params.id) {
		return res
			.status(400)
			.json({ success: false, error: 'Name already exists' });
	}

	let carData;
	if (driver_id && driver_id.length !== 0) {
		const driverExists = await Driver.exists({
			_id: new mongoose.Types.ObjectId(driver_id),
		});

		if (!driverExists) {
			return res
				.status(400)
				.json({ success: false, error: 'The driver not found' });
		}

		carData = req.body;
	} else {
		carData = {
			name: req.body.name,
			license_plate: req.body.license_plate,
			model: req.body.model,
			driver_id: null,
		};
	}

	try {
		const car = await Car.findByIdAndUpdate(req.params.id, carData, {
			new: true,
			runValidators: true,
		});

		if (!car) {
			return res
				.status(404)
				.json({ success: false, error: 'The car not found' });
		}

		return res.status(200).json({
			success: true,
			data: {
				id: car._id,
				name: name ?? car.name,
				license_plate: license_plate ?? car.license_plate,
				model: model ?? car.model,
				driver_id: driver_id ?? car.driver_id,
			},
		});
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
	}
};

//@desc     Delete car
//@route    DELETE /api/cars/:id
//@access   Public
exports.deleteCar = async (req, res, next) => {
	try {
		const car = await Car.findByIdAndDelete(req.params.id);

		if (!car) {
			return res
				.status(404)
				.json({ success: false, error: 'The car not found' });
		}

		await Camera.deleteMany({ car_id: req.params.id });
		await Emergency.deleteMany({ car_id: req.params.id });

		return res.status(200).json({ success: true, data: {} });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};
