const express = require('express');
const {
	getCars,
	createCar,
	updateCar,
	deleteCar,
	getCar,
} = require('../controllers/cars');

const router = express.Router();

router.route('/').get(getCars).post(createCar);
router.route('/:id').get(getCar).put(updateCar).delete(deleteCar);

module.exports = router;
