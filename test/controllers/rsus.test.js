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
			const expectedData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);

			await executeGetTest(
				getRSUs,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by id, when there is a id filter', async () => {
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({ id: rawData[0].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by name, when there is a name filter', async () => {
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
			const expectedData = [rawData[0]];

			await executeGetTest(
				getRSUs,
				generateRequest({ name: rawData[0].name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return RSUs filtered by speed, when there is a speed filter', async () => {
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
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
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
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
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
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
			const rawData = await getCurrentData(RSU, [
				'id',
				'name',
				'recommended_speed',
			]);
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
				generateRequest({}, { id: '123456789012345678901234' }),
				generateFailResponse(message),
				404
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'input must be a 24 character hex string, 12 byte Uint8Array, or an integer';

			await executeGetTest(
				getRSU,
				generateRequest({}, { id: 'invalid' }),
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
				['id', 'name', 'recommended_speed'],
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
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId)
			);
		});

		it('should update the RSU, when name is missing', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId)
			);
		});

		it('should update the RSU, when speed is missing', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU05',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId)
			);
		});

		it('should not update the RSU, when name is invalid', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU 5',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not create the RSU, when name is duplicated', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU01',
				recommended_speed: '160',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				400,
				'Name already exists'
			);
		});

		it('should not update the RSU, when speed is invalid', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: 'invalid',
			};

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				400,
				'Recommended speed should be a valid number'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const updatedId = { id: '123456789012345678901234' };
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message = 'the RSU not found';

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const updatedId = { id: 'invalid' };
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "RSU"';

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const updatedId = (await getCurrentData(RSU, ['id']))[0];
			const updatedRequest = {
				name: 'RSU05',
				recommended_speed: '160',
			};
			const message = 'Error Message';
			sinon.stub(RSU, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest(updatedRequest, updatedId),
				400,
				message
			);

			// Clean up
			RSU.findByIdAndUpdate.restore();
		});
	});

	describe('deleteRSU', () => {
		it('should delete the RSU, when request is valid', async () => {
			const deletedId = (await getCurrentData(RSU, ['id']))[0];

			await executeDeleteTest(
				deleteRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest({}, deletedId)
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const deletedId = { id: '123456789012345678901234' };
			const message = 'the RSU not found';

			await executeDeleteTest(
				deleteRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest({}, deletedId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const deletedId = { id: 'invalid' };
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "RSU"';

			await executeDeleteTest(
				deleteRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest({}, deletedId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const deletedId = (await getCurrentData(RSU, ['id']))[0];
			const message = 'Error Message';
			sinon.stub(RSU, 'findByIdAndDelete').throws(new Error(message));

			await executeDeleteTest(
				deleteRSU,
				RSU,
				['id', 'name', 'recommended_speed'],
				generateRequest({}, deletedId),
				400,
				message
			);

			// Clean up
			RSU.findByIdAndDelete.restore();
		});
	});
});
