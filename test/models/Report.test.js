const { expect } = require('chai');
const Report = require('../../models/Report');
const RSU = require('../../models/RSU');

describe('Report Model Validation', () => {
	let rsu;

	before(async () => {
		const rsuData = {
			name: 'Test RSU',
			recommended_speed: '100',
			latitude: 123.456,
			longitude: -45.678,
		};

		rsu = await RSU.create(rsuData);
	});

	it('should be valid if all required fields are provided', async () => {
		const reportData = {
			type: 'TRAFIC_JAM',
			rsu_id: rsu._id,
			latitude: 123.456,
			longitude: -45.678,
		};

		const report = new Report(reportData);

		expect(report).to.have.property('_id');
		expect(report.rsu_id.toString()).to.equal(reportData.rsu_id.toString());
		expect(report.type).to.equal(reportData.type);
		expect(report.latitude).to.equal(reportData.latitude);
		expect(report.longitude).to.equal(reportData.longitude);
	});

	it('should be invalid if rsu_id is empty', async () => {
		const report = new Report({
			type: 'TRAFIC_JAM',
			latitude: 123.456,
			longitude: -45.678,
		});

		try {
			await report.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.rsu_id.properties.message).to.equal(
				'Please add a RSU'
			);
		}
	});

	it('should be invalid if type is empty', async () => {
		const report = new Report({
			rsu_id: rsu._id,
			latitude: 123.456,
			longitude: -45.678,
		});

		try {
			await report.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.type.properties.message).to.equal(
				'Please add a type'
			);
		}
	});

	it('should be invalid if latitude is empty', async () => {
		const report = new Report({
			type: 'TRAFIC_JAM',
			rsu_id: rsu._id,
			longitude: -45.678,
		});

		try {
			await report.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.latitude.properties.message).to.equal(
				'Please add a latitude'
			);
		}
	});

	it('should be invalid if longitude is empty', async () => {
		const report = new Report({
			type: 'TRAFIC_JAM',
			rsu_id: rsu._id,
			latitude: -45.678,
		});

		try {
			await report.validate();
			expect.fail('Validation should have failed');
		} catch (error) {
			expect(error.errors.longitude.properties.message).to.equal(
				'Please add a longitude'
			);
		}
	});
});
