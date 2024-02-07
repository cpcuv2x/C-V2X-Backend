const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Please add a username'],
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
	},
	role: {
		type: String,
		enum: ['driver', 'admin'],
		required: [true, 'Please add a role'],
	},
	driver_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Driver',
		default: null,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

UserSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('findOneAndUpdate', async function (next) {
	if (this._update.password) {
		const salt = await bcrypt.genSalt(10);
		this._update.password = await bcrypt.hash(this._update.password, salt);
	}
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

//Match user entered password to hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
