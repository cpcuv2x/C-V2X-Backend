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
	username: {
		type: String,
		required: [true, 'Please add a username'],
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
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
