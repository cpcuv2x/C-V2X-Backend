const express = require('express');
const {
	getDrivers,
	createDriver,
	updateDriver,
	deleteDriver,
	getDriver,
} = require('../controllers/drivers');

const router = express.Router();

router.route('/').get(getDrivers).post(createDriver);
router.route('/:id').get(getDriver).put(updateDriver).delete(deleteDriver);

module.exports = router;
