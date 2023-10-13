const mongoose = require('mongoose');
const Car = require('../models/Car');
const Driver = require('../models/Driver');

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
				$project: {
					_id: 1,
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
		res.status(200).json({ success: true, count: cars.length, data: cars });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get all cars list
//@route    GET /api/cars/list
//@access   Public
exports.getCarsList = async (req, res, next) => {
	try {
		const cars = await Car.aggregate([
			{
				$project: {
					id: '$_id',
					name: 1,
				},
			},
		]);
		res.status(200).json({ success: true, count: cars.length, data: cars });
	} catch (err) {
		res.status(400).json({ success: false });
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
					_id: 1,
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

		if (!car) {
			res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: car });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new car
//@route    POST /api/cars
//@access   Public
exports.createCar = async (req, res, next) => {
	if (req.body.driver_id && req.body.driver_id.length !== 0) {
		const driver = await Driver.exists({
			_id: new mongoose.Types.ObjectId(req.body.driver_id),
		});
		if (!driver) {
			res.status(400).json({ success: false });
		} else {
			const car = await Car.create(req.body);
			res.status(201).json({ success: true, data: car });
		}
	} else {
		const car = await Car.create({
			name: req.body.name,
			license_plate: req.body.license_plate,
			model: req.body.model,
		});
		res.status(201).json({ success: true, data: car });
	}
};

//@desc     Update car
//@route    PUT /api/cars/:id
//@access   Public
exports.updateCar = async (req, res, next) => {
	try {
		if (req.body.driver_id && req.body.driver_id.length !== 0) {
			const driver = await Driver.exists({
				_id: new mongoose.Types.ObjectId(req.body.driver_id),
			});
			if (!driver) {
				res.status(400).json({ success: false });
			} else {
				const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
					new: true,
					runValidators: true,
				});

				if (!car) {
					res.status(400).json({ success: false });
				}

				res.status(200).json({ success: true, data: car });
			}
		} else {
			const car = await Car.findByIdAndUpdate(
				req.params.id,
				{
					name: req.body.name,
					license_plate: req.body.license_plate,
					model: req.body.model,
					driver_id: null,
				},
				{
					new: true,
					runValidators: true,
				}
			);

			if (!car) {
				res.status(400).json({ success: false });
			}

			res.status(200).json({ success: true, data: car });
		}
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete car
//@route    DELETE /api/cars/:id
//@access   Public
exports.deleteCar = async (req, res, next) => {
	try {
		const car = await Car.findByIdAndDelete(req.params.id);

		if (!car) {
			res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
