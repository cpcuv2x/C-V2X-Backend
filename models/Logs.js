const mongoose = require('mongoose');

const LogsSchema = new mongoose.Schema({
	car_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car',
	},
	driver_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Driver',
	},
	rsu_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'RSU',
	},
	type :{
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Logs', LogsSchema);
