const express = require('express');
const { getCars } = require('../controllers/cars');

const router = express.Router();

router.route('/').get(getCars);

module.exports = router;
