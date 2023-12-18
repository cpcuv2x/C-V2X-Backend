const { expect } = require('chai');
const Camera = require('../../models/Camera');
const Car = require('../../models/Car');

describe('Camera Model Validation', () => {
	let car;

	before(async () => {
		const carData = {
			name: 'Test Car',
			license_plate: 'ABC123',
			model: 'XYZ',
		};

		car = await Car.create(carData);
	});

	it('should be valid if all required fields are provided', async () => {
		const cameraData = {
			name: 'Test Camera',
			position: 'Front',
			car_id: car._id,
		};

		const camera = new Camera(cameraData);

		expect(camera).to.have.property('_id');
		expect(camera.name).to.equal(cameraData.name);
		expect(camera.position).to.equal(cameraData.position);
		expect(camera.car_id.toString()).to.equal(cameraData.car_id.toString());
	});

	it('should be invalid if name is empty', async () => {
		const camera = new Camera({
			position: 'Front',
			car_id: car._id,
		});

		try {
			await camera.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.name.properties.message).to.equal(
				'Please add a name'
			);
		}
	});

	it('should be invalid if position is empty', async () => {
		const camera = new Camera({
			name: 'Test Camera',
			car_id: car._id,
		});

		try {
			await camera.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.position.properties.message).to.equal(
				'Please add a position'
			);
		}
	});

	it('should be invalid if car_id is empty', async () => {
		const camera = new Camera({
			name: 'Test Camera',
			position: 'Front',
		});

		try {
			await camera.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.car_id.properties.message).to.equal(
				'Please add a name'
			);
		}
	});
});
