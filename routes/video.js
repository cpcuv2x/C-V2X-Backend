const express = require('express');
const {
	videoUpload,
	listExistVideos,
	dowloadVideo,
} = require('../controllers/video');

const router = express.Router();

router.route('/:car_id/:camera_id/:date').get(dowloadVideo);
router.route('/upload').post(videoUpload);
router.route('/exist-videos').get(listExistVideos);

module.exports = router;
