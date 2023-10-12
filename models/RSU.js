const mongoose = require('mongoose');

const RSUSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	recommended_speed: {
		type: String,
		required: [true, 'Please add a recommended speed'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('RSU', RSUSchema);
