const express = require('express');
const { getCameras } = require('../controllers/cameras');

const router = express.Router();

router.route('/').get(getCameras);

module.exports = router;
