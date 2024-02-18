const mongoose = require('mongoose');

const connectMongoDB = async () => {
	try {
		mongoose.set('strictQuery', true);
		const conn = await mongoose.connect(process.env.MONGO_URI);

		console.log(`MongoDB Connected : ${conn.connection.host}`);
	} catch (error) {
		throw new Error(`Error connecting to mongoDB: ${error.message}`);
	}
};

module.exports = connectMongoDB;
