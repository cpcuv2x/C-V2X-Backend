const express = require('express');
const {
	getRSUs,
	getRSUsList,
	getRSU,
	createRSU,
	updateRSU,
	deleteRSU,
} = require('../controllers/rsus');

const router = express.Router();

router.route('/').put(getRSUs).post(createRSU);
router.route('/list').get(getRSUsList);
router.route('/:id').get(getRSU).put(updateRSU).delete(deleteRSU);

module.exports = router;
