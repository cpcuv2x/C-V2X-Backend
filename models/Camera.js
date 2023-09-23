const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	position: {
		type: String,
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

module.exports = mongoose.model('Camera', CameraSchema);
