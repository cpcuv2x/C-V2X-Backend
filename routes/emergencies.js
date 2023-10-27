const express = require('express');
const {
	getEmergencies,
	createEmergency,
	updateEmergency,
} = require('../controllers/emergencies');

const router = express.Router();

router.route('/').get(getEmergencies).post(createEmergency);
router.route('/:id').put(updateEmergency);

module.exports = router;
