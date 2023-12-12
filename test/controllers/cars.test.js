const sinon = require('sinon');
const {
	getCars,
	getCarsList,
	getCar,
	createCar,
	deleteCar,
	updateCar,
} = require('../../controllers/cars');
const Driver = require('../../models/Driver');
const Car = require('../../models/Car');
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

const CarField = ['id', 'name', 'license_plate', 'model', 'driver_id'];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(Car, ['id']);
	return ids[0];
};
const retrieveCars = async () => {
	return (await getCurrentData(Car, CarField)).map((car, index) => ({
		...car,
		driver: `${mockedDrivers[index].first_name} ${mockedDrivers[index].last_name}`,
		cameras: '',
	}));
};

const mockedDrivers = [
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
];

describe('Car Controllers', () => {
	beforeEach(async () => {
		await Driver.create(mockedDrivers);
		const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
			(a, b) => a.first_name.localeCompare(b.first_name)
		);
		await Car.create([
			{
				name: 'Car01',
				license_plate: 'LicensePlate01',
				model: 'Model01',
				driver_id: drivers[0].id,
			},
			{
				name: 'Car02',
				license_plate: 'LicensePlate02',
				model: 'Model02',
				driver_id: drivers[1].id,
			},
			{
				name: 'Car03',
				license_plate: 'LicensePlate03',
				model: 'Model03',
				driver_id: drivers[2].id,
			},
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await Driver.deleteMany({});
		await Car.deleteMany({});
	});

	describe('getCars', () => {
		it('should return all cars, when there is no filter', async () => {
			const expectedData = await retrieveCars();

			await executeGetTest(
				getCars,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by id, when there is a id filter', async () => {
			const rawData = await retrieveCars();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({ id: rawData[0].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});
	});

	describe('getCarsList', () => {
		it('should return all name of cars', async () => {
			const expectedData = (await getCurrentData(Car, ['id', 'name'])).sort(
				(a, b) => a.name.localeCompare(b.name)
			);

			await executeGetTest(
				getCarsList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no car, when database is empty', async () => {
			await Car.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getCarsList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Car, 'find').throws(new Error(message));

			await executeGetTest(
				getCarsList,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Car.find.restore();
		});
	});

	describe('getCar', () => {
		it('should return a single car by valid & exist ID', async () => {
			const rawData = await retrieveCars();
			const expectedData = rawData[0];

			await executeGetTest(
				getCar,
				generateRequest({}, { id: rawData[0].id }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the car not found';

			await executeGetTest(
				getCar,
				generateRequest({}, notExistId),
				generateFailResponse(message),
				404
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'input must be a 24 character hex string, 12 byte Uint8Array, or an integer';

			await executeGetTest(
				getCar,
				generateRequest({}, invalidId),
				generateFailResponse(message),
				400
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Car, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getCar,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Car.aggregate.restore();
		});
	});
});
