const sinon = require('sinon');
const {
	getEmergencies,
	createEmergency,
	updateEmergency,
} = require('../../controllers/emergencies');
const Emergency = require('../../models/Emergency');
const {
	getCurrentData,
	generateRequest,
	generateSuccessResponse,
	generateFailResponse,
	executeGetTest,
	executeCreateTest,
	executeUpdateTest,
	executeDeleteTest,
} = require('../../utils/test');

const EmergencyField = ['id', 'car_id', 'status', 'latitude', 'longitude'];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(Emergency, ['id']);
	return ids[0];
};
