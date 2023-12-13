const { expect } = require('chai');
const Car = require('../../models/Car');
const Driver = require('../../models/Driver');

describe('Car Model Validation', () => {
	it('should be valid if all required fields are provided', async () => {
		const driverData = {
			first_name: 'John',
			last_name: 'Doe',
			username: 'johndoe',
			password: 'password123',
			phone_no: '1234567890',
		};

		const driver = await Driver.create(driverData);

		const carData = {
			name: 'Test Car',
			license_plate: 'ABC123',
			model: 'XYZ',
			driver_id: driver._id,
		};

		const car = new Car(carData);

		expect(car).to.have.property('_id');
		expect(car.name).to.equal(carData.name);
		expect(car.license_plate).to.equal(carData.license_plate);
		expect(car.model).to.equal(carData.model);
		expect(car.driver_id.toString()).to.equal(carData.driver_id.toString());
	});

	it('should be invalid if name is empty', async () => {
		const car = new Car({
			license_plate: 'ABC123',
			model: 'XYZ',
		});

		try {
			await car.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.name.properties.message).to.equal(
				'Please add a name'
			);
		}
	});

	it('should be invalid if license_plate is empty', async () => {
		const car = new Car({
			name: 'Test Car',
			model: 'XYZ',
		});

		try {
			await car.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.license_plate.properties.message).to.equal(
				'Please add a license plate'
			);
		}
	});

	it('should be invalid if model is empty', async () => {
		const car = new Car({
			name: 'Test Car',
			license_plate: 'ABC123',
		});

		try {
			await car.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.model.properties.message).to.equal(
				'Please add a model'
			);
		}
	});

	it('should be valid if driver_id is not provided (null)', async () => {
		const car = new Car({
			name: 'Test Car',
			license_plate: 'ABC123',
			model: 'XYZ',
		});

		try {
			await car.validate();
			expect(car.driver_id).to.equal(null);
		} catch (error) {
			expect.fail('Validation should have passed');
		}
	});
});
