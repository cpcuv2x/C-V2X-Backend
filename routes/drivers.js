const express = require('express');
const { getDrivers } = require('../controllers/drivers');

const router = express.Router();

router.route('/').get(getDrivers);

module.exports = router;
