var cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Video = require('../models/Video');
const Camera = require('../models/Camera');
const Car = require('../models/Car');
const fs = require('fs');

const mongoose = require('mongoose');
const path = require('path');

const videoDirectory = path.join(__dirname, '../videos');

// Ensure the videos directory exists
if (!fs.existsSync(videoDirectory)) {
	fs.mkdirSync(videoDirectory);
}

exports.videoUpload = async (req, res, next) => {
	try {
		const { data, fileName } = req.body;

		if (!data || !fileName) {
			return res
				.status(400)
				.json({ error: 'Missing data or fileName in the request body.' });
		}

		// Decode base64 data to binary
		const videoData = Buffer.from(data, 'base64');

		// Define the destination path where you want to save the file
		const destinationPath = path.join(videoDirectory, fileName + '.mp4');
		fs.writeFile(destinationPath, videoData, (err) => {
			if (err) {
				return res.status(500).json({ error: 'Error saving file.' });
			}
			// Respond with a success message
			res.status(200).json({
				success: true,
				message: 'File uploaded and saved successfully.',
			});
		});
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
		let data = [];
		const files = fs.readdirSync(videoDirectory);
		files.forEach((file) => {
			const [carId, cameraId, timeStamp] = file.replace('.mp4', '').split('-');
			if (carId == car_id && cameraId == camera_id) {
				console.log(timeStamp);
				data.push({
					videosTimestamp: new Date(parseInt(timeStamp)).toLocaleString(),
				});
			}
		});
		return res.json({ data });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};
