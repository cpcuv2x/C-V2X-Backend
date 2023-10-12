const express = require('express');
const {
	getRSUs,
	createRSU,
	updateRSU,
	deleteRSU,
	getRSU,
} = require('../controllers/rsus');

const router = express.Router();

router.route('/').get(getRSUs).post(createRSU);
router.route('/:id').get(getRSU).put(updateRSU).delete(deleteRSU);

module.exports = router;
