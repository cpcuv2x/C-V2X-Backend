const { expect } = require('chai');
const Driver = require('../../models/Driver');

describe('Driver Model Validation', () => {
	it('should be valid if all required fields are provided', () => {
		const driverData = {
			first_name: 'John',
			last_name: 'Doe',
			username: 'johndoe',
			password: 'password123',
			phone_no: '1234567890',
		};

		const driver = new Driver(driverData);

		expect(driver).to.have.property('_id');
		expect(driver.first_name).to.equal(driverData.first_name);
		expect(driver.last_name).to.equal(driverData.last_name);
		expect(driver.username).to.equal(driverData.username);
		expect(driver.password).to.equal(driverData.password);
		expect(driver.phone_no).to.equal(driverData.phone_no);
	});

	it('should be invalid if first_name is empty', async () => {
		const driver = new Driver({
			last_name: 'Doe',
			username: 'johndoe',
			password: 'password123',
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
			username: 'johndoe',
			password: 'password123',
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

	it('should be invalid if username is empty', async () => {
		const driver = new Driver({
			first_name: 'John',
			last_name: 'Doe',
			password: 'password123',
			phone_no: '1234567890',
		});

		try {
			await driver.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.username.properties.message).to.equal(
				'Please add a username'
			);
		}
	});

	it('should be invalid if password is empty', async () => {
		const driver = new Driver({
			first_name: 'John',
			last_name: 'Doe',
			username: 'johndoe',
			phone_no: '1234567890',
		});

		try {
			await driver.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.password.properties.message).to.equal(
				'Please add a password'
			);
		}
	});

	it('should be invalid if phone_no is empty', async () => {
		const driver = new Driver({
			first_name: 'John',
			last_name: 'Doe',
			username: 'johndoe',
			password: 'password123',
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
