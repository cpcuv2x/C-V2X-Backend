const socketIO = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

const cars = [];
const controlCenters = [];

function setupWebRTCSocketIO(server) {
	const io = socketIO(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		// console.log(`Client connected: ${socket.id}`);
		RTCMultiConnectionServer.addSocket(socket);

		socket.on('control center connecting', async (data) => {
			console.log('control center connecting');
			try {
				const controlCenter = controlCenters.find(
					(m) => m.roomID == data.roomID
				);
				// console.log(cars);
				if (!controlCenter) {
					controlCenters.push({ socket: socket, roomID: data.roomID });
				} else {
					controlCenter.socket = socket;
				}
			} catch (err) {
				console.log(err);
				return;
			}
		});

		socket.on('car connecting', async (data) => {
			try {
				const car = cars.find((m) => m.id == data.carID);
				if (!car) {
					if (data.camNumber == 1) {
						cars.push({
							id: data.carID,
							cam1: socket,
							cam2: null,
						});
					} else {
						cars.push({
							id: data.carID,
							cam1: null,
							cam2: socket,
						});
					}
				} else {
					if (data.camNumber == 1) {
						car.cam1 = socket;
					} else {
						car.cam2 = socket;
					}
				}
			} catch (err) {
				console.log(err);
				return;
			}
		});

		socket.on('start recording', async (data) => {
			console.log('start recording');
			try {
				const car = cars.find((m) => m.id == data.carID);
				// console.log(cars);
				if (car) {
					car.cam1?.emit('start recording');
					// console.log(car.cam1);
					car.cam2?.emit('start recording');
				}
			} catch (err) {
				console.log(err);
				return;
			}
		});

		socket.on('stop recording', async (data) => {
			console.log('stop recording');
			try {
				const car = cars.find((m) => m.id == data.carID);
				// console.log(cars);
				if (car) {
					car.cam1?.emit('stop recording');
					// console.log(car.cam1);
					car.cam2?.emit('stop recording');
				}
			} catch (err) {
				console.log(err);
				return;
			}
		});

		socket.on('send object detection', async (data) => {
			// console.log('send object detection', data.roomID);
			try {
				controlCenters.forEach((controlCenter) => {
					if (data.roomID == controlCenter.roomID) {
						controlCenter.socket?.emit('send object detection', data.boxes);
					}
				});
			} catch (err) {
				console.log(err);
				return;
			}
		});
	});
}

module.exports = { setupWebRTCSocketIO };
