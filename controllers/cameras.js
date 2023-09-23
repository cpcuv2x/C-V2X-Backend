const Camera = require('../models/Camera');

//@desc     Get all cameras
//@route    GET /api/cameras
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

//@desc     Get single camera
//@route    GET /api/cameras/:id
//@access   Public
exports.getCamera = async (req, res, next) => {
	try {
		const camera = await Camera.findById(req.params.id);

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
	const camera = await Camera.create(req.body);
	res.status(201).json({ success: true, data: camera });
};

//@desc     Update camera
//@route    PUT /api/cameras/:id
//@access   Public
exports.updateCamera = async (req, res, next) => {
	try {
		const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!camera) {
			res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: camera });
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
