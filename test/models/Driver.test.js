const { expect } = require('chai');
const Driver = require('../../models/Driver');

describe('Driver Model Validation', () => {
	it('should be valid if all required fields are provided', () => {
		const driverData = {
			first_name: 'John',
			last_name: 'Doe',
			phone_no: '1234567890',
		};

		const driver = new Driver(driverData);

		expect(driver).to.have.property('_id');
		expect(driver.first_name).to.equal(driverData.first_name);
		expect(driver.last_name).to.equal(driverData.last_name);
		expect(driver.phone_no).to.equal(driverData.phone_no);
	});

	it('should be invalid if first_name is empty', async () => {
		const driver = new Driver({
			last_name: 'Doe',
			phone_no: '1234567890',
		});

		try {
			await driver.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.first_name.properties.message).to.equal(
				'Please add a first name'
			);
		}
	});

	it('should be invalid if last_name is empty', async () => {
		const driver = new Driver({
			first_name: 'John',
			phone_no: '1234567890',
		});

		try {
			await driver.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.last_name.properties.message).to.equal(
				'Please add a last name'
			);
		}
	});

	it('should be invalid if phone_no is empty', async () => {
		const driver = new Driver({
			first_name: 'John',
			last_name: 'Doe',
		});

		try {
			await driver.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.phone_no.properties.message).to.equal(
				'Please add a phone number'
			);
		}
	});
});
