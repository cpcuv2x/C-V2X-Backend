exports.socketMiddleware = (socket) => {
	return (req, _res, next) => {
		req.socket = socket;
		next();
	};
};
