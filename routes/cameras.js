const express = require('express');
const {
	getCameras,
	createCamera,
	updateCamera,
	deleteCamera,
	getCamera,
} = require('../controllers/cameras');

const router = express.Router();

router.route('/').get(getCameras).post(createCamera);
router.route('/:id').get(getCamera).put(updateCamera).delete(deleteCamera);

module.exports = router;
