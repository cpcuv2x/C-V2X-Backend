var cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Video = require('../models/Video');
const Camera = require('../models/Camera');
const Car = require('../models/Car');

const mongoose = require('mongoose');

exports.videoUpload = async (req, res, next) => {
	let url = '';
	try {
		let fileStr = req.body.data;
		dotenv.config({ path: '../config/config.env' });
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		const uploadedResponse = await cloudinary.uploader.upload_large(fileStr, {
			resource_type: 'video',
			chunk_size: 6000000,
		});
		url = uploadedResponse.url;
		await Video.create({
			url,
			cam_id: new mongoose.Types.ObjectId(req.body.cam_id),
			car_id: new mongoose.Types.ObjectId(req.body.car_id),
		});
		return res.status(200).json({ data: url });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};

exports.listExistVideos = async (req, res, next) => {
	const { car_id, camera_id } = req.query;
	if (!car_id || !camera_id) {
		return res
			.status(400)
			.json({ error: 'car_id and camera_id must be provided' });
	}
	try {
		// Find the videos that match the provided car and camera IDs
		const videos = await Video.find({
			$and: [
				{ car_id: new mongoose.Types.ObjectId(car_id) },
				{ cam_id: new mongoose.Types.ObjectId(camera_id) },
			],
		}).sort({ createdAt: -1 });

		// Extracting the distinct createdAt values
		const data = videos.map((video) => {
			return { videosTimestamp: video.createdAt, url: video.url };
		});
		return res.json({ data });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};
