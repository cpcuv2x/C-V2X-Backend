const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	license_plate: {
		type: String,
		required: [true, 'Please add a license plate'],
	},
	model: {
		type: String,
		required: [true, 'Please add a model'],
	},
	driver_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Driver',
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Car', CarSchema);
