const { expect } = require('chai');
const User = require('../../models/User');
const Driver = require('../../models/Driver');

describe('User Model Validation', () => {
	it('should be valid if all required fields are provided', async () => {
		const driverData = {
			first_name: 'John',
			last_name: 'Doe',
			username: 'johndoe',
			password: 'password123',
			phone_no: '1234567890',
		};

		const driver = await Driver.create(driverData);

		const userData = {
			username: 'mockedUsername',
			password: 'mockedPassword',
			role: 'driver',
			driver_id: driver._id,
		};

		const user = new User(userData);

		expect(user).to.have.property('_id');
		expect(user.username).to.equal(userData.username);
		expect(user.password).to.equal(userData.password);
		expect(user.role).to.equal(userData.role);
		expect(user.driver_id).to.equal(userData.driver_id);
	});

	it('should be invalid if username is empty', async () => {
		const user = new User({
			password: 'mockedPassword',
			role: 'admin',
		});

		try {
			await user.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.username.properties.message).to.equal(
				'Please add a username'
			);
		}
	});

	it('should be invalid if password is empty', async () => {
		const user = new User({
			username: 'mockedUsername',
			role: 'admin',
		});

		try {
			await user.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.password.properties.message).to.equal(
				'Please add a password'
			);
		}
	});

	it('should be invalid if role is empty', async () => {
		const user = new User({
			username: 'mockedUsername',
			password: 'mockedPassword',
		});

		try {
			await user.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.role.properties.message).to.equal(
				'Please add a role'
			);
		}
	});

	it('should be valid if driver_id is empty', async () => {
		const user = new User({
			username: 'mockedUsername',
			password: 'mockedPassword',
			role: 'admin',
		});

		try {
			await user.validate();
			expect(user.driver_id).to.equal(null);
		} catch (error) {
			expect.fail('Validation should have failed');
		}
	});
});
