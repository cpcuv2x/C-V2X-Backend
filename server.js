// Express
const express = require('express');
// Socket
const http = require('http');
const socketIO = require('socket.io');
// Configs
const dotenv = require('dotenv');
const connectMongoDB = require('./config/connectMongoDB');
const { connectRabbitMQ } = require('./config/rabbitMQConnection');
const { setupWebRTCSocketIO } = require('./config/webRTCConnection');
// Cookie parser
const cookieParser = require('cookie-parser');
// Route files
const auth = require('./routes/auth');
const cars = require('./routes/cars');
const cameras = require('./routes/cameras');
const drivers = require('./routes/drivers');
const rsus = require('./routes/rsus');
const emergencies = require('./routes/emergencies');
const { fleetController } = require('./controllers/fleet');
const { createEmergency } = require('./controllers/emergencies');
const { socketMiddleware } = require('./middleware/socket');
const videoUpload = require('./routes/video');
// Securities
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// Swaggers
const swaggerDocs = require('./config/swaggerDocs');
const swaggerUI = require('swagger-ui-express');

// Load env vars
dotenv.config({ path: './config/config.env' });

const APP_PORT = process.env.APP_PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3426;

// Connect to database
connectMongoDB();

// Create socket server
const socket = http.createServer();
const io = socketIO(socket, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// Connect to rabbitMQ
connectRabbitMQ().then(() => {
	fleetController(io);
	createEmergency(io);
});
setupWebRTCSocketIO(io);

// Create app server
const app = express();
app.use(cors());
app.use(helmet()); //Set security headers
app.use(hpp()); //Prevent http param pollutions
app.use(mongoSanitize()); //Sanitize data
app.use(xss()); //Prevent XSS attacks
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));
// Body parser
app.use('/api/auth', auth);
app.use('/api/cars', cars);
app.use('/api/cameras', cameras);
app.use('/api/drivers', drivers);
app.use('/api/rsus', rsus);
app.use('/api/emergencies', socketMiddleware(io), emergencies);
app.use('/api/videos', videoUpload);
// Cookie parser
app.use(cookieParser());
// Swagger API
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Map socket server to port
socket.listen(
	SOCKET_PORT,
	console.log(`Socket.IO listening on port ${SOCKET_PORT}`)
);

// Map app server to port
const appServer = app.listen(
	APP_PORT,
	console.log(
		'Server running in',
		process.env.NODE_ENV,
		'mode on port',
		APP_PORT
	)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.stack}`);
	// Close server & exit process
	appServer.close(() => process.exit(1));
});
