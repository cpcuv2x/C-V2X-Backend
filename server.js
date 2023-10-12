const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

// Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

// Route files
const cars = require('./routes/cars');
const cameras = require('./routes/cameras');
const drivers = require('./routes/drivers');
const rsus = require('./routes/rsus');

const app = express();
app.use(cors());

//Body parser
app.use(express.json());
app.use('/api/cars', cars);
app.use('/api/cameras', cameras);
app.use('/api/drivers', drivers);
app.use('/api/rsus', rsus);

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
