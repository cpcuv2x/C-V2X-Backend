const { expect } = require('chai');
const sinon = require('sinon');
const {
	getEmergencies,
	createEmergency,
	updateEmergency,
} = require('../../controllers/emergencies');
const Driver = require('../../models/Driver');
const Car = require('../../models/Car');
const Emergency = require('../../models/Emergency');
const {
	getCurrentData,
	generateRequest,
	generateSuccessResponse,
	generateFailResponse,
	executeGetTest,
	executeCreateTest,
	executeUpdateTest,
} = require('../../utils/test');

const EmergencyField = ['id', 'car_id', 'status', 'latitude', 'longitude'];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(Emergency, ['id']);
	return ids[0];
};

const mockedDriver = [
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
];

describe('Emergency Controllers', () => {
	let createdTime;
	beforeEach(async () => {
		await Driver.create(mockedDriver);
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
				driver_id: null,
			},
		]);
		const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		const currentTime = new Date(Date.now());
		const hours = (currentTime.getHours() + 17) % 24;
		const minutes = currentTime.getMinutes();
		const period = (currentTime.getHours() + 17) % 24 < 12 ? 'am' : 'pm';
		createdTime = `${hours < 10 ? '0' + hours : hours}:${
			minutes < 10 ? '0' : ''
		}${minutes} ${period}`;

		await Emergency.create([
			{ car_id: cars[0].id, status: 'pending', latitude: 1, longitude: 1 },
			{
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 2,
				longitude: 2,
			},
			{ car_id: cars[2].id, status: 'complete', latitude: 3, longitude: 3 },
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await Driver.deleteMany({});
		await Car.deleteMany({});
		await Emergency.deleteMany({});
	});

	describe('getEmergencies', () => {
		it('should return all emergencies, when there is no filter', async () => {
			const cars = await getCurrentData(Car, ['id', 'name', 'driver_id']);
			const drivers = await getCurrentData(Driver, ['id', 'phone_no']);
			const expectedData = (await getCurrentData(Emergency, EmergencyField))
				.map((emergency, index) => {
					const car = cars.filter((car) => car.id === emergency.car_id)[0];
					const driver = drivers.filter(
						(driver) => driver.id.toString() === car.driver_id
					)[0];
					return {
						id: emergency.id,
						status: emergency.status,
						car_name: car.name,
						driver_phone_no: driver?.phone_no ?? '',
						time: createdTime,
					};
				})
				.sort((a, b) => a.car_name.localeCompare(b.car_name));

			await executeGetTest(
				getEmergencies,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no emergency, when database is empty', async () => {
			await Emergency.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getEmergencies,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Emergency, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getEmergencies,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Emergency.aggregate.restore();
		});
	});

	describe('createEmergency', () => {
		it('should create the emergency, when request is valid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				latitude: 4,
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency)
			);
		});

		it('should not create the emergency, when car_id is missing', async () => {
			const newEmergency = {
				status: 'pending',
				latitude: 4,
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				400,
				'Please add a car_id'
			);
		});

		it('should create the emergency, when status is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				latitude: 4,
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency)
			);
		});

		it('should create the emergency, when latitude is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency)
			);
		});

		it('should create the emergency, when longitude is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				latitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency)
			);
		});

		it('should not create the emergency, when car_id does not exist', async () => {
			const newEmergency = {
				car_id: notExistId,
				status: 'pending',
				latitude: 4,
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				404,
				'the car not found'
			);
		});

		it('should not create the emergency, when status is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'invalid',
				latitude: 4,
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				400,
				'Status should be pending, inProgress or complete'
			);
		});

		it('should not create the emergency, when latitude is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				latitude: 'invalid',
				longitude: 4,
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				400,
				'Latitude should be number'
			);
		});

		it('should not create the emergency, when longitude is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				latitude: 4,
				longitude: 'invalid',
			};

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				400,
				'Longitude should be number'
			);
		});

		it('should handle errors and return 400 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newEmergency = {
				car_id: cars[0].id,
				status: 'pending',
				latitude: 4,
				longitude: 4,
			};
			const message = 'Error Message';
			sinon.stub(Emergency, 'create').throws(new Error(message));

			await executeCreateTest(
				createEmergency,
				Emergency,
				EmergencyField,
				generateRequest(newEmergency),
				400,
				message
			);

			// Clean up
			Emergency.create.restore();
		});
	});

	describe('updateEmergency', () => {
		it('should update the emergency, when request is valid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the emergency, when car_id is missing', async () => {
			const updatedRequest = {
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the emergency, when status is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				latitude: 4,
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the emergency, when latitude is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the emergency, when longitude is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the emergency, when car_id does not exist', async () => {
			const updatedRequest = {
				car_id: notExistId,
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId()),
				404,
				'the car not found'
			);
		});

		it('should not update the emergency, when status is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'invalid',
				latitude: 4,
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Status should be pending, inProgress or complete'
			);
		});
		it('should not update the emergency, when latitude is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 'invalid',
				longitude: 4,
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Latitude should be number'
			);
		});

		it('should not update the emergency, when longitude is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
				longitude: 'invalid',
			};

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Longitude should be number'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};
			const message = 'the emergency not found';

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Emergency"';

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				car_id: cars[1].id,
				status: 'inProgress',
				latitude: 4,
				longitude: 4,
			};
			const message = 'Error Message';
			sinon.stub(Emergency, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateEmergency,
				Emergency,
				EmergencyField,
				generateRequest(updatedRequest, invalidId),
				400,
				message
			);

			// Clean up
			Emergency.findByIdAndUpdate.restore();
		});
	});
});
