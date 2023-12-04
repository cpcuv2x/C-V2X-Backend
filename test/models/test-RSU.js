const { expect } = require('chai');
const RSU = require('../../models/RSU');

describe('RSU Model', () => {
	it('should create a new RSU', async () => {
		const rsuData = {
			name: 'Test RSU',
			recommended_speed: '100',
		};

		const createdRSU = await RSU.create(rsuData);

		expect(createdRSU).to.have.property('_id');
		expect(createdRSU.name).to.equal(rsuData.name);
		expect(createdRSU.recommended_speed).to.equal(rsuData.recommended_speed);
	});

	it('should not save RSU without name', async () => {
		try {
			await RSU.create({
				recommended_speed: '100',
			});

			throw new Error('Test should have thrown an error for missing name');
		} catch (error) {
			expect(error.message).to.include('Please add a name');
		}
	});

	it('should not save RSU without recommended_speed', async () => {
		try {
			await RSU.create({
				name: 'Test RSU',
			});

			throw new Error(
				'Test should have thrown an error for missing recommended_speed'
			);
		} catch (error) {
			expect(error.message).to.include('Please add a recommended speed');
		}
	});
});
