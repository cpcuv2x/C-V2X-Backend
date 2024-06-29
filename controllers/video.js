const fs = require('fs');
const path = require('path');

const videoDirectory = path.join('/data/videos/');
// if (!fs.existsSync(videoDirectory)) {
// 	fs.mkdirSync(videoDirectory);
// }

const videoOriginalDirectory = path.join(__dirname, '../data/videos/original');
// Ensure the videos directory exists
// if (!fs.existsSync(videoOriginalDirectory)) {
// 	fs.mkdirSync(videoOriginalDirectory);
// }

const videoPanopticDirectory = path.join(__dirname, '../data/videos/panoptic');
// Ensure the videos directory exists
// if (!fs.existsSync(videoPanopticDirectory)) {
// 	fs.mkdirSync(videoPanopticDirectory);
// }

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
		const destinationPath = path.join(
			videoOriginalDirectory,
			fileName + '.mp4'
		);
		console.log(destinationPath);
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
		const files = fs.readdirSync(videoPanopticDirectory);
		files.forEach((file) => {
			const [carId, cameraId, timeStamp] = file.replace('.mp4', '').split('-');
			if (carId == car_id && cameraId == camera_id) {
				data.push({
					videosTimestamp: timeStamp,
				});
			}
		});
		return res.json({ data });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};

exports.dowloadVideo = async (req, res, next) => {
	const { car_id, camera_id, date } = req.params;
	if (!car_id || !camera_id || !date) {
		return res
			.status(400)
			.json({ error: 'car_id and camera_id and date must be provided' });
	}
	try {
		const fileName = `${car_id}-${camera_id}-${date}`;
		const videoPath = path.join(videoPanopticDirectory, fileName + '.mp4');
		const stat = fs.statSync(videoPath);
		const fileSize = stat.size;
		const range = req.headers.range;
		if (range) {
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
			const chunkSize = end - start + 1;
			const file = fs.createReadStream(videoPath, { start, end });
			const head = {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunkSize,
				'Content-Type': 'video/mp4',
			};

			res.writeHead(206, head);
			file.pipe(res);
		} else {
			const head = {
				'Content-Length': fileSize,
				'Content-Type': 'video/mp4',
			};

			res.writeHead(200, head);
			fs.createReadStream(videoPath).pipe(res);
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};
