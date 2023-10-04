const mongoose = require('mongoose');

const CarLogSchema = new mongoose.Schema({
	car_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car',
		default: null,
	},
	speed: {
		type: Number,
		default: null,
	},
	latitude: {
		type: Number,
		default: null,
	},
	longitude: {
		type: Number,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('CarLog', CarLogSchema);
