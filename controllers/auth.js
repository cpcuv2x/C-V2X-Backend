const User = require('../models/User');
const Car = require('../models/Car');

//@desc     Login user
//@route    POST /api/auth/login
//@access   Public
exports.login = async (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			success: false,
			error: 'Please provide an username and password',
		});
	}

	const user = await User.findOne({ username }).select('+password');
	if (!user) {
		return res.status(400).json({
			success: false,
			error: 'Invalid credentials',
		});
	}

	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return res.status(401).json({
			success: false,
			error: 'Invalid credentials',
		});
	}

	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: true,
	};

	const car =
		user.driver_id && (await Car.findOne({ driver_id: user.driver_id }));
	const car_id = car?._id;

	res.cookie('token', token, options);
	return res.status(200).json({
		success: true,
		data: {
			token,
			role: user.role,
			car_id,
		},
	});
};

//@desc Log user out / clear cookie
//@route GET /api/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	return res.status(200).json({
		success: true,
		data: {},
	});
};
