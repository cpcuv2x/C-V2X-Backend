const chai = require('chai');
const sinon = require('sinon');
const { getRSUs, getRSUsList, getRSU } = require('../../controllers/rsus');
const RSU = require('../../models/RSU');

const expect = chai.expect;

describe('RSU Controllers', () => {
	beforeEach(async () => {
		await RSU.create([
			{ name: 'RSU 1', recommended_speed: '100' },
			{ name: 'RSU 2', recommended_speed: '120' },
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await RSU.deleteMany({});
	});

	describe('getRSUs', () => {
		afterEach(() => {
			sinon.restore();
		});

		const executeTest = async (
			requestBody,
			expectedData,
			expectedStatus = 200,
			expectedResponse = null
		) => {
			// Action
			const mockResponse = {
				status: sinon.stub().returnsThis(),
				json: sinon.spy(),
			};

			await getRSUs({ body: requestBody }, mockResponse);

			// Assert
			let actualResponse;
			if (expectedResponse) {
				actualResponse = mockResponse.json.getCall(0).args[0];
			} else {
				actualResponse = {
					success: mockResponse.json.getCall(0).args[0].success,
					count: mockResponse.json.getCall(0).args[0].count,
					data: mockResponse.json
						.getCall(0)
						.args[0].data.map(({ name, recommended_speed }) => ({
							name,
							recommended_speed,
						})),
				};
			}

			const actualStatus = mockResponse.status.getCall(0).args[0];

			expect(actualStatus).to.deep.equal(expectedStatus);

			if (expectedResponse) {
				expect(actualResponse).to.deep.equal(expectedResponse);
			} else {
				expect(actualResponse).to.deep.equal({
					success: true,
					count: expectedData.length,
					data: expectedData,
				});
			}
		};

		it('should return all RSUs, when there is no filter', async () => {
			const expectedData = [
				{ name: 'RSU 1', recommended_speed: '100' },
				{ name: 'RSU 2', recommended_speed: '120' },
			];

			await executeTest({}, expectedData);
		});

		it('should return RSUs filtered by name, when there is a name filter', async () => {
			const expectedData = [{ name: 'RSU 1', recommended_speed: '100' }];

			await executeTest({ name: '1' }, expectedData);
		});

		it('should return RSUs filtered by speed, when there is a speed filter', async () => {
			const expectedData = [{ name: 'RSU 2', recommended_speed: '120' }];

			await executeTest({ recommended_speed: '2' }, expectedData);
		});

		it('should return RSUs filtered by name & speed, when there are name & speed filters', async () => {
			const expectedData = [];

			await executeTest({ name: '1', recommended_speed: '2' }, expectedData);
		});

		it('should handle errors and return 400 status', async () => {
			const expectedErrorMessage = 'Error Message';
			sinon.stub(RSU, 'aggregate').throws(new Error(expectedErrorMessage));

			const expectedResponse = {
				success: false,
				error: expectedErrorMessage,
			};

			await executeTest({}, [], 400, expectedResponse);

			// Clean up
			RSU.aggregate.restore();
		});
	});
});
