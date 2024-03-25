const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
	url: {
		type: String,
		required: [true, 'Please add a url'],
	},
	cam_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Camera',
		required: [true, 'Please add a position'],
	},
	car_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car',
		required: [true, 'Please add a name'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Video', VideoSchema);
