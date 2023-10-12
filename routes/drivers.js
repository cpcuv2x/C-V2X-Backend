const express = require('express');
const {
	getDrivers,
	getDriversList,
	getDriver,
	createDriver,
	updateDriver,
	deleteDriver,
} = require('../controllers/drivers');

const router = express.Router();

router.route('/').get(getDrivers).post(createDriver);
router.route('/list').get(getDriversList);
router.route('/:id').get(getDriver).put(updateDriver).delete(deleteDriver);

module.exports = router;
