const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const limiter = rateLimit({
	windowsMs: 60 * 1000, // 1 min
	max: 1000,
});

const app = express();

// Route files
const cars = require('./routes/cars');
const cameras = require('./routes/cameras');
const drivers = require('./routes/drivers');
const rsus = require('./routes/rsus');
const emergencies = require('./routes/emergencies');

app.use(cors());
app.use(limiter); //Rate Limiting
app.use(helmet()); //Set security headers
app.use(express.json());
app.use(hpp()); //Prevent http param pollutions
app.use(mongoSanitize()); //Sanitize data
app.use(xss()); //Prevent XSS attacks

// Body parser
app.use('/api/cars', cars);
app.use('/api/cameras', cameras);
app.use('/api/drivers', drivers);
app.use('/api/rsus', rsus);
app.use('/api/emergencies', emergencies);

// Cookie parser
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

//Swagger API
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'C-V2X API',
			version: '1.0.0',
			description: 'C-V2X API documents',
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				BearerAuth: [],
			},
		],
		servers: [
			{
				url: `http://localhost:${PORT}`,
			},
		],
	},
	apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const server = app.listen(
	PORT,
	console.log(
		'Server running in ',
		process.env.NODE_ENV,
		' mode on port ',
		PORT
	)
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	//Close server & exit process
	server.close(() => process.exit(1));
});
