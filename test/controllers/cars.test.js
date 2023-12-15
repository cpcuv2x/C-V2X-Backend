const sinon = require('sinon');
const { expect } = require('chai');
const {
	getCars,
	getCarsList,
	getCar,
	createCar,
	deleteCar,
	updateCar,
} = require('../../controllers/cars');
const Camera = require('../../models/Camera');
const Emergency = require('../../models/Emergency');
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
	const cameras = (
		await getCurrentData(Camera, ['id', 'name', 'position'])
	).sort((a, b) => a.name.localeCompare(b.name));
	return (await getCurrentData(Car, CarField))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((car, index) => ({
			...car,
			driver: `${mockedDrivers[index].first_name} ${mockedDrivers[index].last_name}`,
			cameras:
				index === 0
					? [
							{
								id: cameras[0].id,
								name: cameras[0].name,
								position: cameras[0].position,
							},
					  ]
					: index === 1
					? [
							{
								id: cameras[1].id,
								name: cameras[1].name,
								position: cameras[1].position,
							},
					  ]
					: [
							{
								id: cameras[2].id,
								name: cameras[2].name,
								position: cameras[2].position,
							},
					  ],
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
		const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
			a.name.localeCompare(b.name)
		);
		await Camera.create([
			{
				name: 'Camera01',
				position: 'Front',
				car_id: cars[0].id,
			},
			{
				name: 'Camera02',
				position: 'Back',
				car_id: cars[1].id,
			},
			{
				name: 'Camera03',
				position: 'Front',
				car_id: cars[2].id,
			},
		]);
	});

	afterEach(async () => {
		sinon.restore();
		await Camera.deleteMany({});
		await Driver.deleteMany({});
		await Emergency.deleteMany({});
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

		it('should return cars filtered by name, when there is a name filter', async () => {
			const rawData = await retrieveCars();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({ name: rawData[0].name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by front_cam_id, when there is a front_cam_id filter', async () => {
			const rawData = await retrieveCars();
			const cameras = (
				await getCurrentData(Camera, ['id', 'name', 'position'])
			).sort((a, b) => a.name.localeCompare(b.name));
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({
					front_cam_id: cameras[0].id.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by back_cam_id, when there is a back_cam_id filter', async () => {
			const rawData = await retrieveCars();
			const cameras = (
				await getCurrentData(Camera, ['id', 'name', 'position'])
			).sort((a, b) => a.name.localeCompare(b.name));
			const expectedData = [rawData[1]];

			await executeGetTest(
				getCars,
				generateRequest({ back_cam_id: cameras[1].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by license_plate, when there is a license_plate filter', async () => {
			const rawData = await retrieveCars();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({ license_plate: rawData[0].license_plate.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by model, when there is a model filter', async () => {
			const rawData = await retrieveCars();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({ model: rawData[0].model.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by driver_id, when there is a driver_id filter', async () => {
			const rawData = await retrieveCars();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({ driver_id: rawData[0].driver_id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cars filtered by id & name & front_cam_id & back_cam_id & license_plate & model & driver_id, when there are id & name & front_cam_id & back_cam_id & license_plate & model & driver_id exist', async () => {
			const rawData = await retrieveCars();
			const cameras = (
				await getCurrentData(Camera, ['id', 'name', 'position'])
			).sort((a, b) => a.name.localeCompare(b.name));
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCars,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[0].name.slice(1),
					front_cam_id: cameras[0].id.slice(1),
					back_cam_id: '',
					license_plate: rawData[0].license_plate.slice(1),
					model: rawData[0].model.slice(1),
					driver_id: rawData[0].driver_id.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no car filtered by id & name & front_cam_id & back_cam_id & license_plate & model & driver_id, when there are id & name & front_cam_id & back_cam_id & license_plate & model & driver_id not exist', async () => {
			const rawData = await retrieveCars();
			const cameras = (
				await getCurrentData(Camera, ['id', 'name', 'position'])
			).sort((a, b) => a.name.localeCompare(b.name));
			const expectedData = [];

			await executeGetTest(
				getCars,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[1].name.slice(1),
					front_cam_id: cameras[0].id.slice(1),
					back_cam_id: cameras[1].id.slice(1),
					license_plate: rawData[0].license_plate.slice(1),
					model: rawData[0].model.slice(1),
					driver_id: rawData[0].driver_id.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no car, when database is empty', async () => {
			await Car.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getCars,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Car, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getCars,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Car.aggregate.restore();
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

	describe('createCar', () => {
		it('should create the car, when request is valid', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				name: 'Car04',
				license_plate: 'LicensePlate04',
				model: 'Model04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar)
			);
		});

		it('should not create the car, when name is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				license_plate: 'LicensePlate04',
				model: 'Model04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				'Please add a name'
			);
		});

		it('should not create the car, when license_plate is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				name: 'Car04',
				model: 'Model04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				'Please add a license_plate'
			);
		});

		it('should not create the car, when model is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				name: 'Car04',
				license_plate: 'LicensePlate04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				'Please add a model'
			);
		});

		it('should create the car, when driver_id is missing', async () => {
			const newCar = {
				name: 'Car04',
				license_plate: 'LicensePlate04',
				model: 'Model04',
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar)
			);
		});

		it('should not create the car, when name is invalid', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				name: 'Car 4',
				license_plate: 'LicensePlate04',
				model: 'Model04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not create the car, when name is duplicated', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const newCar = {
				name: 'Car01',
				license_plate: 'LicensePlate04',
				model: 'Model04',
				driver_id: drivers[0].id,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				'Name already exists'
			);
		});

		it('should not create the car, when driver_id does not exist', async () => {
			const newCar = {
				name: 'Car04',
				license_plate: 'LicensePlate04',
				model: 'Model04',
				driver_id: notExistId,
			};

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				404,
				'the driver not found'
			);
		});

		it('should handle errors and return 400 status', async () => {
			const newCar = {
				name: 'Car04',
				license_plate: 'LicensePlate04',
				model: 'Model04',
			};
			const message = 'Error Message';
			sinon.stub(Car, 'create').throws(new Error(message));

			await executeCreateTest(
				createCar,
				Car,
				CarField,
				generateRequest(newCar),
				400,
				message
			);

			// Clean up
			Car.create.restore();
		});
	});

	describe('updateCar', () => {
		it('should update the car, when request is valid', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the car, when name is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				license_plate: 'LicensePlate05',
				model: 'Model05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the car, when license_plate is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				name: 'Car05',
				model: 'Model05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the car, when model is missing', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the car, when driver_id is missing', async () => {
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the car, when name is invalid', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				name: 'Car 5',
				license_plate: 'LicensePlate05',
				model: 'Model05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not update the car, when name is duplicated', async () => {
			const drivers = (await getCurrentData(Driver, ['id', 'first_name'])).sort(
				(a, b) => a.first_name.localeCompare(b.first_name)
			);
			const updatedRequest = {
				name: 'Car02',
				license_plate: 'LicensePlate05',
				model: 'Model05',
				driver_id: drivers[0].id,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name already exists'
			);
		});

		it('should not update the car, when driver_id does not exist', async () => {
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
				driver_id: notExistId,
			};

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'the driver not found'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
			};
			const message = 'the car not found';

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Car"';

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const updatedRequest = {
				name: 'Car05',
				license_plate: 'LicensePlate05',
				model: 'Model05',
			};
			const message = 'Error Message';
			sinon.stub(Car, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateCar,
				Car,
				CarField,
				generateRequest(updatedRequest, await firstId()),
				400,
				message
			);

			// Clean up
			Car.findByIdAndUpdate.restore();
		});
	});

	describe('deleteCar', () => {
		it('should delete the car, when request is valid', async () => {
			const carId = await firstId();
			const cameraId = {
				id: (await Camera.findOne({ car_id: carId.id }))._id.toString(),
			};
			const emergencyId = {
				id: await Emergency.create({ car_id: carId.id }),
			};

			await executeDeleteTest(
				deleteCar,
				Car,
				CarField,
				generateRequest({}, carId)
			);

			const cameras = await getCurrentData(Camera, ['id']);
			const emergencies = await getCurrentData(Emergency, ['id']);
			expect(cameras).to.deep.not.include(cameraId);
			expect(emergencies).to.deep.not.include(emergencyId);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the car not found';

			await executeDeleteTest(
				deleteCar,
				Car,
				CarField,
				generateRequest({}, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Car"';

			await executeDeleteTest(
				deleteCar,
				Car,
				CarField,
				generateRequest({}, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Car, 'findByIdAndDelete').throws(new Error(message));

			await executeDeleteTest(
				deleteCar,
				Car,
				CarField,
				generateRequest({}, await firstId()),
				400,
				message
			);

			// Clean up
			Car.findByIdAndDelete.restore();
		});
	});
});
