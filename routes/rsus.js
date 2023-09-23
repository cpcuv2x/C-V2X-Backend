const express = require('express');
const { getRSUs } = require('../controllers/rsus');

const router = express.Router();

router.route('/').get(getRSUs);

module.exports = router;
