const express = require('express');
const { videoUpload } = require('../controllers/video');

const router = express.Router();

router.route('/').post(videoUpload);

module.exports = router;
