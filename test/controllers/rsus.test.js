const sinon = require('sinon');
const {
	getRSUs,
	getRSUsList,
	getRSU,
	createRSU,
	updateRSU,
	deleteRSU,
} = require('../../controllers/rsus');
const RSU = require('../../models/RSU');
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

const RSUField = ['id', 'name', 'recommended_speed'];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(RSU, ['id']);
	return ids[0];
};

describe('RSU Controllers', () => {
	beforeEach(async () => {
		await RSU.create([
			{ name: 'RSU01', recommended_speed: '100' },
			{ name: 'RSU02', recommended_speed: '120' },
			{ name: 'RSU03', recommended_speed: '140' },
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await RSU.deleteMany({});
	});

	describe('getRSUs', () => {
		it('should return all RSUs, when there is no filter', async () => {
			const expectedData = await getCurrentData(RSU, RSUField);

			await executeGetTest(
				getRSUs,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by id, when there is a id filter', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({ id: rawData[0].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by name, when there is a name filter', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({ name: rawData[0].name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by speed, when there is a speed filter', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({
					recommended_speed: rawData[0].recommended_speed.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by id & name & speed, when there are id & name & speed filters exist', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[0].name.slice(1),
					recommended_speed: rawData[0].recommended_speed.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no RSU filtered by id & name & speed, when there are id & name & speed filters not exist', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = [];

			await executeGetTest(
				getRSUs,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[1].name.slice(1),
					recommended_speed: rawData[0].recommended_speed.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no RSU, when database is empty', async () => {
			await RSU.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getRSUs,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(RSU, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getRSUs,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			RSU.aggregate.restore();
		});
	});

	describe('getRSUsList', () => {
		it('should return all name of RSUs', async () => {
			const expectedData = await getCurrentData(RSU, ['id', 'name']);

			await executeGetTest(
				getRSUsList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no RSU, when database is empty', async () => {
			await RSU.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getRSUsList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(RSU, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getRSUsList,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			RSU.aggregate.restore();
		});
	});

	describe('getRSU', () => {
		it('should return a single RSU by valid & exist ID', async () => {
			const rawData = await getCurrentData(RSU, RSUField);
			const expectedData = rawData[0];

			await executeGetTest(
				getRSU,
				generateRequest({}, { id: rawData[0].id }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the RSU not found';

			await executeGetTest(
				getRSU,
				generateRequest({}, notExistId),
				generateFailResponse(message),
				404
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'input must be a 24 character hex string, 12 byte Uint8Array, or an integer';

			await executeGetTest(
				getRSU,
				generateRequest({}, invalidId),
				generateFailResponse(message),
				400
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(RSU, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getRSU,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			RSU.aggregate.restore();
		});
	});

	describe('createRSU', () => {
		it('should create the RSU, when request is valid', async () => {
			const newRSU = {
				name: 'RSU04',
				recommended_speed: '160',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU)
			);
		});

		it('should not create the RSU, when name is missing', async () => {
			const newRSU = {
				recommended_speed: '160',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				'Please add a name'
			);
		});

		it('should not create the RSU, when name is invalid', async () => {
			const newRSU = {
				name: 'RSU 4',
				recommended_speed: '160',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not create the RSU, when name is duplicated', async () => {
			const newRSU = {
				name: 'RSU01',
				recommended_speed: '160',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				'Name already exists'
			);
		});

		it('should not create the RSU, when speed is missing', async () => {
			const newRSU = {
				name: 'RSU04',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				'Please add a recommended speed'
			);
		});

		it('should not create the RSU, when speed is invalid', async () => {
			const newRSU = {
				name: 'RSU04',
				recommended_speed: 'invalid',
			};

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				'Recommended speed should be a valid number'
			);
		});

		it('should handle errors and return 400 status', async () => {
			const newRSU = {
				name: 'RSU04',
				recommended_speed: '160',
			};
			const message = 'Error Message';
			sinon.stub(RSU, 'create').throws(new Error(message));

			await executeCreateTest(
				createRSU,
				RSU,
				RSUField,
				generateRequest(newRSU),
				400,
				message
			);

			// Clean up
			RSU.create.restore();
		});
	});

	describe('updateRSU', () => {
		it('should update the RSU, when request is valid', async () => {
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the RSU, when name is missing', async () => {
			const updatedRequest = {
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the RSU, when speed is missing', async () => {
			const updatedRequest = {
				name: 'RSU05',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the RSU, when name is invalid', async () => {
			const updatedRequest = {
				name: 'RSU 5',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not create the RSU, when name is duplicated', async () => {
			const updatedRequest = {
				name: 'RSU02',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name already exists'
			);
		});

		it('should not update the RSU, when speed is invalid', async () => {
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: 'invalid',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Recommended speed should be a valid number'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message = 'the RSU not found';

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "RSU"';

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message = 'Error Message';
			sinon.stub(RSU, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateRSU,
				RSU,
				RSUField,
				generateRequest(updatedRequest, await firstId()),
				400,
				message
			);

			// Clean up
			RSU.findByIdAndUpdate.restore();
		});
	});

	describe('deleteRSU', () => {
		it('should delete the RSU, when request is valid', async () => {
			await executeDeleteTest(
				deleteRSU,
				RSU,
				RSUField,
				generateRequest({}, await firstId())
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the RSU not found';

			await executeDeleteTest(
				deleteRSU,
				RSU,
				RSUField,
				generateRequest({}, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "RSU"';

			await executeDeleteTest(
				deleteRSU,
				RSU,
				RSUField,
				generateRequest({}, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(RSU, 'findByIdAndDelete').throws(new Error(message));

			await executeDeleteTest(
				deleteRSU,
				RSU,
				RSUField,
				generateRequest({}, await firstId()),
				400,
				message
			);

			// Clean up
			RSU.findByIdAndDelete.restore();
		});
	});
});
