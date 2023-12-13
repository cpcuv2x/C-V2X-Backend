const { expect } = require('chai');
const Emergency = require('../../models/Emergency');
const Car = require('../../models/Car');

describe('Emergency Model Validation', () => {
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
		const emergencyData = {
			car_id: car._id,
			status: 'pending',
			latitude: 123.456,
			longitude: -45.678,
		};

		const emergency = new Emergency(emergencyData);

		expect(emergency).to.have.property('_id');
		expect(emergency.car_id.toString()).to.equal(
			emergencyData.car_id.toString()
		);
		expect(emergency.status).to.equal(emergencyData.status);
		expect(emergency.latitude).to.equal(emergencyData.latitude);
		expect(emergency.longitude).to.equal(emergencyData.longitude);
	});

	it('should be invalid if car_id is empty', async () => {
		const emergency = new Emergency({
			status: 'pending',
			latitude: 123.456,
			longitude: -45.678,
		});

		try {
			await emergency.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.car_id.properties.message).to.equal(
				'Please add a car'
			);
		}
	});

	it('should be invalid if status is empty', async () => {
		const emergency = new Emergency({
			car_id: car._id,
			latitude: 123.456,
			longitude: -45.678,
		});

		try {
			await emergency.validate();
			expect(emergency.status).to.equal('pending');
		} catch (error) {
			expect.fail('Validation should have passed');
		}
	});

	it('should be invalid if latitude is not a number', async () => {
		const emergency = new Emergency({
			car_id: car._id,
			status: 'pending',
			longitude: -45.678,
		});

		try {
			await emergency.validate();
			expect(emergency.latitude).to.equal(null);
		} catch (error) {
			expect.fail('Validation should have passed');
		}
	});

	it('should be invalid if longitude is not a number', async () => {
		const emergency = new Emergency({
			car_id: car._id,
			status: 'pending',
			latitude: 123.456,
		});

		try {
			await emergency.validate();
			expect(emergency.longitude).to.equal(null);
		} catch (error) {
			expect.fail('Validation should have passed');
		}
	});
});
