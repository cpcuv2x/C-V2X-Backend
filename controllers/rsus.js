const RSU = require('../models/RSU');

//@desc     Get all RSUs
//@route    GET /api/v1/rsus
//@access   Public
exports.getRSUs = async (req, res, next) => {
	try {
		const rsus = await RSU.find();
		res.status(200).json({ success: true, count: rsus.length, data: rsus });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
