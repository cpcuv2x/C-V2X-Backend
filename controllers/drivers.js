const Driver = require('../models/Driver');

//@desc     Get all drivers
//@route    GET /api/v1/drivers
//@access   Public
exports.getDrivers = async (req, res, next) => {
	try {
		const drivers = await Driver.find();
		res
			.status(200)
			.json({ success: true, count: drivers.length, data: drivers });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
