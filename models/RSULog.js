const mongoose = require('mongoose');

const RSULogSchema = new mongoose.Schema({
	rsu_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'RSU',
		default: null,
	},
	car_ids: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Car',
			default: null,
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('RSULog', RSULogSchema);
