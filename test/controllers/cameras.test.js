const sinon = require('sinon');
const {
	getCameras,
	getCamerasList,
	getCamera,
	createCamera,
	deleteCamera,
	updateCamera,
} = require('../../controllers/cameras');
const Car = require('../../models/Car');
const Camera = require('../../models/Camera');
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

const CameraField = ['id', 'name', 'position', 'car_id'];
const notExistId = { id: '123456789012345678901234' };
const invalidId = { id: 'invalid' };
const firstId = async () => {
	const ids = await getCurrentData(Camera, ['id']);
	return ids[0];
};
const retrieveCameras = async () => {
	return (await getCurrentData(Camera, CameraField))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((camera, index) => ({
			...camera,
			car: mockedCars[index].name,
		}));
};

const mockedCars = [
	{
		name: 'Car01',
		license_plate: 'LicensePlate01',
		model: 'Model01',
	},
	{
		name: 'Car02',
		license_plate: 'LicensePlate02',
		model: 'Model02',
	},
	{
		name: 'Car03',
		license_plate: 'LicensePlate03',
		model: 'Model03',
	},
	{
		name: 'Car04',
		license_plate: 'LicensePlate04',
		model: 'Model04',
	},
];

describe('Camera Controllers', () => {
	beforeEach(async () => {
		await Car.create(mockedCars);
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
		await Car.deleteMany({});
		await Camera.deleteMany({});
	});

	describe('getCameras', () => {
		it('should return all cameras, when there is no filter', async () => {
			const expectedData = await retrieveCameras();

			await executeGetTest(
				getCameras,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cameras filtered by id, when there is a id filter', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCameras,
				generateRequest({ id: rawData[0].id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cameras filtered by name, when there is a name filter', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCameras,
				generateRequest({ name: rawData[0].name.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cameras filtered by position, when there is a position filter', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [rawData[0], rawData[2]];

			await executeGetTest(
				getCameras,
				generateRequest({ position: rawData[0].position.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cameras filtered by car_id, when there is a car_id filter', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCameras,
				generateRequest({ car_id: rawData[0].car_id.slice(1) }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return cameras filtered by id & name & position & car_id, when there are id & name & position & car_id exist', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [rawData[0]];

			await executeGetTest(
				getCameras,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[0].name.slice(1),
					position: rawData[0].position.slice(1),
					car_id: rawData[0].car_id.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no camera filtered by id & name & position & car_id, when there are id & name & position & car_id not exist', async () => {
			const rawData = await retrieveCameras();
			const expectedData = [];

			await executeGetTest(
				getCameras,
				generateRequest({
					id: rawData[0].id.slice(1),
					name: rawData[1].name.slice(1),
					position: rawData[0].position.slice(1),
					car_id: rawData[0].car_id.slice(1),
				}),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no camera, when database is empty', async () => {
			await Camera.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getCameras,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Camera, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getCameras,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Camera.aggregate.restore();
		});
	});

	describe('getCamerasList', () => {
		it('should return all name of cameras', async () => {
			const expectedData = (await getCurrentData(Camera, ['id', 'name'])).sort(
				(a, b) => a.name.localeCompare(b.name)
			);

			await executeGetTest(
				getCamerasList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should return no camera, when database is empty', async () => {
			await Camera.deleteMany({});
			const expectedData = [];

			await executeGetTest(
				getCamerasList,
				generateRequest(),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Camera, 'find').throws(new Error(message));

			await executeGetTest(
				getCamerasList,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Camera.find.restore();
		});
	});

	describe('getCamera', () => {
		it('should return a single camera by valid & exist ID', async () => {
			const rawData = await retrieveCameras();
			const expectedData = rawData[0];

			await executeGetTest(
				getCamera,
				generateRequest({}, { id: rawData[0].id }),
				generateSuccessResponse(expectedData)
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the camera not found';

			await executeGetTest(
				getCamera,
				generateRequest({}, notExistId),
				generateFailResponse(message),
				404
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'input must be a 24 character hex string, 12 byte Uint8Array, or an integer';

			await executeGetTest(
				getCamera,
				generateRequest({}, invalidId),
				generateFailResponse(message),
				400
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Camera, 'aggregate').throws(new Error(message));

			await executeGetTest(
				getCamera,
				generateRequest(),
				generateFailResponse(message),
				400
			);

			// Clean up
			Camera.aggregate.restore();
		});
	});

	describe('createCamera', () => {
		it('should create the camera, when request is valid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera04',
				position: 'Back',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera)
			);
		});

		it('should not create the camera, when name is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				position: 'Back',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Please add a name'
			);
		});

		it('should not create the camera, when car_id is missing', async () => {
			const newCamera = {
				name: 'Camera04',
				position: 'Back',
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Please add a car_id'
			);
		});

		it('should not create the camera, when position is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera04',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Please add a position'
			);
		});

		it('should not create the camera, when name is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera 4',
				position: 'Back',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not create the camera, when name is duplicated', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera01',
				position: 'Back',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Name already exists'
			);
		});

		it('should not create the camera, when car_id does not exist', async () => {
			const newCamera = {
				name: 'Camera04',
				position: 'Back',
				car_id: notExistId,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				404,
				'the car not found'
			);
		});

		it('should not create the camera, when position is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera04',
				position: 'invalid',
				car_id: cars[3].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Position should be Front or Back'
			);
		});

		it('should not create the camera, when position is duplicated', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera04',
				position: 'Back',
				car_id: cars[1].id,
			};

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				'Position of the car already exists'
			);
		});

		it('should handle errors and return 400 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const newCamera = {
				name: 'Camera04',
				position: 'Back',
				car_id: cars[3].id,
			};
			const message = 'Error Message';
			sinon.stub(Camera, 'create').throws(new Error(message));

			await executeCreateTest(
				createCamera,
				Camera,
				CameraField,
				generateRequest(newCamera),
				400,
				message
			);

			// Clean up
			Camera.create.restore();
		});
	});

	describe('updateCamera', () => {
		it('should update the camera, when request is valid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera05',
				position: 'Front',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the camera, when name is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				position: 'Front',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the camera, when position is missing', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera05',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should update the camera, when car_id is missing', async () => {
			const updatedRequest = {
				name: 'Camera05',
				position: 'Front',
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId())
			);
		});

		it('should not update the camera, when name is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera 5',
				position: 'Front',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name should not contain spaces'
			);
		});

		it('should not update the camera, when car_id does not exist', async () => {
			const updatedRequest = {
				name: 'Camera05',
				position: 'Front',
				car_id: notExistId,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				404,
				'the car not found'
			);
		});

		it('should not update the camera, when position is invalid', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera05',
				position: 'invalid',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Position should be Front or Back'
			);
		});

		it('should update the camera, when name is duplicated', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera01',
				position: 'Front',
				car_id: cars[3].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Name already exists'
			);
		});

		it('should update the camera, when position is duplicated', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera05',
				position: 'Front',
				car_id: cars[0].id,
			};

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				400,
				'Position of the car already exists'
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const cars = (await getCurrentData(Car, ['id', 'name'])).sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const updatedRequest = {
				name: 'Camera05',
				position: 'Front',
				car_id: cars[3].id,
			};
			const message = 'the camera not found';

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
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
				name: 'Camera05',
				position: 'Front',
				car_id: cars[3].id,
			};
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Camera"';

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
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
				name: 'Camera05',
				position: 'Front',
				car_id: cars[3].id,
			};
			const message = 'Error Message';
			sinon.stub(Camera, 'findByIdAndUpdate').throws(new Error(message));

			await executeUpdateTest(
				updateCamera,
				Camera,
				CameraField,
				generateRequest(updatedRequest, await firstId()),
				400,
				message
			);

			// Clean up
			Camera.findByIdAndUpdate.restore();
		});
	});

	describe('deleteCamera', () => {
		it('should delete the camera, when request is valid', async () => {
			await executeDeleteTest(
				deleteCamera,
				Camera,
				CameraField,
				generateRequest({}, await firstId())
			);
		});

		it('should handle valid & not exist ID and return 404 status', async () => {
			const message = 'the camera not found';

			await executeDeleteTest(
				deleteCamera,
				Camera,
				CameraField,
				generateRequest({}, notExistId),
				404,
				message
			);
		});

		it('should handle invalid ID and return 400 status', async () => {
			const message =
				'Cast to ObjectId failed for value "invalid" (type string) at path "_id" for model "Camera"';

			await executeDeleteTest(
				deleteCamera,
				Camera,
				CameraField,
				generateRequest({}, invalidId),
				400,
				message
			);
		});

		it('should handle errors and return 400 status', async () => {
			const message = 'Error Message';
			sinon.stub(Camera, 'findByIdAndDelete').throws(new Error(message));

			await executeDeleteTest(
				deleteCamera,
				Camera,
				CameraField,
				generateRequest({}, await firstId()),
				400,
				message
			);

			// Clean up
			Camera.findByIdAndDelete.restore();
		});
	});
});
