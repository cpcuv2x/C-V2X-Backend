const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	type: {
		type: String,
		required: [true, 'Please add a type'],
	},
	rsu_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'RSU',
		required: [true, 'Please add a RSU'],
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
		default: Date.now,
	},
});

module.exports = mongoose.model('Report', ReportSchema);
