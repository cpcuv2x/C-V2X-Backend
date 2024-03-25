const express = require('express');
const { videoUpload, listExistVideos } = require('../controllers/video');

const router = express.Router();

router.route('/upload').post(videoUpload);
router.route('/exist-videos').get(listExistVideos);

module.exports = router;
