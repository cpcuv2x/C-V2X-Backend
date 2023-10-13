const express = require('express');
const {
	getCameras,
	getCamerasList,
	getCamera,
	createCamera,
	updateCamera,
	deleteCamera,
} = require('../controllers/cameras');

const router = express.Router();

router.route('/').put(getCameras).post(createCamera);
router.route('/list').get(getCamerasList);
router.route('/:id').get(getCamera).put(updateCamera).delete(deleteCamera);

module.exports = router;
