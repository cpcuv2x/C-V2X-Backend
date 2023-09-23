const Camera = require('../models/Camera');

//@desc     Get all cameras
//@route    GET /api/v1/cameras
//@access   Public
exports.getCameras = async (req, res, next) => {
	try {
		const cameras = await Camera.find();
		res
			.status(200)
			.json({ success: true, count: cameras.length, data: cameras });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
