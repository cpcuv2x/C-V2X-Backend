const express = require('express');
const {
	getCars,
	getCarsList,
	getCar,
	createCar,
	updateCar,
	deleteCar,
} = require('../controllers/cars');

const router = express.Router();

router.route('/').put(getCars).post(createCar);
router.route('/list').get(getCarsList);
router.route('/:id').get(getCar).put(updateCar).delete(deleteCar);

module.exports = router;
