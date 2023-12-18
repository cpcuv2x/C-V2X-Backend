const User = require('../models/User');

//@desc     Login user
//@route    POST /api/auth/login
//@access   Public
exports.login = async (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			success: false,
			msg: 'Please provide an username and password',
		});
	}

	const user = await User.findOne({ username }).select('+password');
	if (!user) {
		return res.status(400).json({
			success: false,
			msg: 'Invalid credentials',
		});
	}

	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return res.status(401).json({
			success: false,
			msg: 'Invalid credentials',
		});
	}

	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(200).cookie('token', token, options).json({
		success: true,
		token,
	});
};
