const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
	car_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car',
		required: [true, 'Please add a car'],
	},
	status: {
		type: String,
		default: 'pending',
	},
	latitude: {
		type: Number,
		required: [true, 'Please add a latitude'],
	},
	longitude: {
		type: Number,
		required: [true, 'Please add a longitude'],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('Emergency', EmergencySchema);
