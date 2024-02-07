const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	type: {
		type: String,
	},
	rsu_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'RSU',
		required: [true, 'Please add a RSU'],
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

module.exports = mongoose.model('Report', ReportSchema);
