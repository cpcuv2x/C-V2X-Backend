const sinon = require('sinon');
const {
	getDrivers,
	getDriversList,
	getDriver,
	createDriver,
	deleteDriver,
	updateDriver,
} = require('../../controllers/drivers');
const Car = require('../../models/Car');
const Driver = require('../../models/Driver');
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
const { expect } = require('chai');

const DriverField = [
	'id',
	'first_name',
	'last_name',
	'username',
	'password',
	'phone_no',
];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(Driver, ['id']);
	return ids[0];
};
const retrieveDrivers = async () => {
	return (await getCurrentData(Driver, DriverField)).map(
		({ password, ...rest }) => ({
			...rest,
			name: `${rest.first_name} ${rest.last_name}`,
		})
	);
};

describe('Driver Controllers', () => {
	beforeEach(async () => {
		await Driver.create([
			{
				first_name: 'Somchai01',
				last_name: 'KonDee01',
				username: 'Username01',
				password: 'Password01',
				phone_no: '111-111-1111',
			},
			{
				first_name: 'Somchai02',
				last_name: 'KonDee02',
				username: 'Username02',
				password: 'Password02',
				phone_no: '222-222-2222',
			},
			{
				first_name: 'Somchai03',
				last_name: 'KonDee03',
				username: 'Username03',
				password: 'Password03',
				phone_no: '333-333-3333',
			},
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await Driver.deleteMany({});
	});

	describe('getDrivers', () => {
		it('should return all Drivers, when there is no filter', async () => {
			const expectedData = await retrieveDrivers();

			await executeGetTest(
				getDrivers,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by id, when there is a id filter', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getDrivers,
				generateRequest({ id: rawData[0].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by first_name, when there is a first_name filter', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getDrivers,
				generateRequest({ first_name: rawData[0].first_name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by last_name, when there is a last_name filter', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getDrivers,
				generateRequest({ last_name: rawData[0].last_name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by username, when there is a username filter', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getDrivers,
				generateRequest({ username: rawData[0].username.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by phone_no, when there is a phone_no filter', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getDrivers,
				generateRequest({ phone_no: rawData[0].phone_no.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return Drivers filtered by id & first_name & last_name & username & phone_no, when there are id & first_name & last_name & username & phone_no exist', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [];

			await executeGetTest(
				getDrivers,
				generateRequest({
					id: rawData[0].id.slice(1),
					first_name: rawData[1].first_name.slice(1),
					last_name: rawData[0].last_name.slice(1),
					username: rawData[0].username.slice(1),
					phone_no: rawData[0].phone_no.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no driver filtered by id & first_name & last_name & username & phone_no, when there are id & first_name & last_name & username & phone_no not exist', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = [];

			await executeGetTest(
				getDrivers,
				generateRequest({
					id: rawData[0].id.slice(1),
					first_name: rawData[1].first_name.slice(1),
					last_name: rawData[0].last_name.slice(1),
					username: rawData[0].username.slice(1),
					phone_no: rawData[0].phone_no.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no driver, when database is empty', async () => {
			await Driver.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getDrivers,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Driver, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getDrivers,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Driver.aggregate.restore();
		});
	});

	describe('getDriversList', () => {
		it('should return all name of Drivers', async () => {
			const expectedData = (await retrieveDrivers()).map((driver) => ({
				id: driver.id,
				name: driver.name,
			}));

			await executeGetTest(
				getDriversList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no driver, when database is empty', async () => {
			await Driver.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getDriversList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Driver, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getDriversList,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Driver.aggregate.restore();
		});
	});

	describe('getDriver', () => {
		it('should return a single driver by valid & exist ID', async () => {
			const rawData = await retrieveDrivers();
			const expectedData = rawData[0];

			await executeGetTest(
				getDriver,
				generateRequest({}, { id: rawData[0].id }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the driver not found';

			await executeGetTest(
				getDriver,
				generateRequest({}, notExistId),
				generateFailResponse(message),
				404
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'input must be a 24 character hex string, 12 byte Uint8Array, or an integer';

			await executeGetTest(
				getDriver,
				generateRequest({}, invalidId),
				generateFailResponse(message),
				400
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Driver, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getDriver,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Driver.aggregate.restore();
		});
	});

	describe('createDriver', () => {
		it('should create the driver, when request is valid', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver)
			);
		});

		it('should not create the driver, when first_name is missing', async () => {
			const newDriver = {
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Please add a first_name'
			);
		});

		it('should not create the driver, when last_name is missing', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Please add a last_name'
			);
		});

		it('should not create the driver, when username is missing', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Please add a username'
			);
		});

		it('should not create the driver, when password is missing', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Please add a password'
			);
		});

		it('should not create the driver, when phone_no is missing', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Please add a phone_no'
			);
		});

		it('should not create the driver, when first_name is invalid', async () => {
			const newDriver = {
				first_name: 'Somchai 4',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'First name should not contain spaces'
			);
		});

		it('should not create the driver, when last_name is invalid', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee 4',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Last name should not contain spaces'
			);
		});

		it('should not create the driver, when name is duplicated', async () => {
			const newDriver = {
				first_name: 'Somchai01',
				last_name: 'KonDee01',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Name already exists'
			);
		});

		it('should not create the driver, when username is invalid', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username 4',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Username should not contain spaces'
			);
		});

		it('should not create the driver, when username is duplicated', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username01',
				password: 'Password04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Username already exists'
			);
		});

		it('should not create the driver, when password has space', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password 4',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Password should not contain spaces and should be at least 8 characters'
			);
		});

		it('should not create the driver, when password is less then 8 characters', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Pass04',
				phone_no: '444-444-4444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Password should not contain spaces and should be at least 8 characters'
			);
		});

		it('should not create the driver, when phone_no is invalid', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '4444444444',
			};

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				'Phone Number should be xxx-xxx-xxxx format'
			);
		});

		it('should handle errors and return 400 status', async () => {
			const newDriver = {
				first_name: 'Somchai04',
				last_name: 'KonDee04',
				username: 'Username04',
				password: 'Password04',
				phone_no: '444-444-4444',
			};
			const message = 'Error Message';
			sinon.stub(Driver, 'create').throws(new Error(message));

			await executeCreateTest(
				createDriver,
				Driver,
				DriverField,
				generateRequest(newDriver),
				400,
				message
			);

			// Clean up
			Driver.create.restore();
		});
	});

	describe('updateDriver', () => {
		it('should update the driver, when request is valid', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the driver, when first_name is missing', async () => {
			const updatedRequest = {
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the driver, when last_name is missing', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the driver, when name is duplicated', async () => {
			const updatedRequest = {
				first_name: 'Somchai01',
				last_name: 'KonDee01',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest),
				400,
				'Name already exists'
			);
		});

		it('should update the driver, when username is missing', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the driver, when username is duplicated', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username01',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest),
				400,
				'Username already exists'
			);
		});

		it('should update the driver, when password is missing', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the driver, when phone_no is missing', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the driver, when first_name is invalid', async () => {
			const updatedRequest = {
				first_name: 'Somchai 5',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'First name should not contain spaces'
			);
		});

		it('should not update the driver, when last_name is invalid', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee 5',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Last name should not contain spaces'
			);
		});

		it('should not update the driver, when username is invalid', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username 5',
				password: 'Password05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Username should not contain spaces'
			);
		});

		it('should not update the driver, when password has space', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password 5',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Password should not contain spaces and should be at least 8 characters'
			);
		});

		it('should not update the driver, when password is less then 8 characters', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Pass05',
				phone_no: '555-555-5555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Password should not contain spaces and should be at least 8 characters'
			);
		});

		it('should not update the driver, when phone_no is invalid', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '5555555555',
			};

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Phone Number should be xxx-xxx-xxxx format'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};
			const message = 'the driver not found';

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Driver"';

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const updatedRequest = {
				first_name: 'Somchai05',
				last_name: 'KonDee05',
				username: 'Username05',
				password: 'Password05',
				phone_no: '555-555-5555',
			};
			const message = 'Error Message';
			sinon.stub(Driver, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateDriver,
				Driver,
				DriverField,
				generateRequest(updatedRequest, await firstId()),
				400,
				message
			);

			// Clean up
			Driver.findByIdAndUpdate.restore();
		});
	});

	describe('deleteDriver', () => {
		it('should delete the driver, when request is valid', async () => {
			const driverId = await firstId();
			await Car.create(
				{
					name: 'Car01',
					license_plate: 'LicensePlate01',
					model: 'Model01',
					driver_id: driverId.id,
				},
				{
					name: 'Car02',
					license_plate: 'LicensePlate02',
					model: 'Model02',
					driver_id: driverId.id,
				},
				{
					name: 'Car03',
					license_plate: 'LicensePlate03',
					model: 'Model03',
					driver_id: driverId.id,
				}
			);

			await executeDeleteTest(
				deleteDriver,
				Driver,
				DriverField,
				generateRequest({}, driverId)
			);

			const cars = await Car.find();
			expect(cars[0].driver_id).to.be.null;
			expect(cars[1].driver_id).to.be.null;
			expect(cars[2].driver_id).to.be.null;
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the driver not found';

			await executeDeleteTest(
				deleteDriver,
				Driver,
				DriverField,
				generateRequest({}, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Driver"';

			await executeDeleteTest(
				deleteDriver,
				Driver,
				DriverField,
				generateRequest({}, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Driver, 'findByIdAndDelete').throws(new Error(message));

			await executeDeleteTest(
				deleteDriver,
				Driver,
				DriverField,
				generateRequest({}, await firstId()),
				400,
				message
			);

			// Clean up
			Driver.findByIdAndDelete.restore();
		});
	});
});
