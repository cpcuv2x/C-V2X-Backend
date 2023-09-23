const Car = require('../models/Car');

//@desc     Get all cars
//@route    GET /api/v1/cars
//@access   Public
exports.getCars = async (req, res, next) => {
	try {
		const cars = await Car.find();
		res.status(200).json({ success: true, count: cars.length, data: cars });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
