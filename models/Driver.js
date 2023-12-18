const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: [true, 'Please add a first name'],
	},
	last_name: {
		type: String,
		required: [true, 'Please add a last name'],
	},
	phone_no: {
		type: String,
		required: [true, 'Please add a phone number'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Driver', DriverSchema);
