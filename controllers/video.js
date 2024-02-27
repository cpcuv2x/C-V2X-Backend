var cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

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
		return res.status(200).json({ data: url });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Something wrong' });
	}
};
