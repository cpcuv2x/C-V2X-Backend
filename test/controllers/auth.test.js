const sinon = require('sinon');
const { login, logout } = require('../../controllers/auth');
const User = require('../../models/User');
const { generateRequest } = require('../../utils/test');
const chai = require('chai');
const expect = chai.expect;

describe('Auth Controllers', () => {
	let app;

	beforeEach(async () => {
		await User.create([
			{ username: 'username01', password: 'password01' },
			{ username: 'username02', password: 'password02' },
			{ username: 'username03', password: 'password03' },
		]);
		process.env = {
			JWT_SECRET: '12345',
			JWT_EXPIRE: '1d',
			JWT_COOKIE_EXPIRE: '1',
		};
	});

	afterEach(async () => {
		sinon.restore();
		await User.deleteMany({});
	});

	it('should login a user and return a JWT token', async () => {
		const requestBody = generateRequest({
			username: 'username01',
			password: 'password01',
		});

		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await login(requestBody, mockResponse);

		// Assert - response
		const response = mockResponse.json.getCall(0).args[0];
		expect(response.success).to.be.true;
		expect(response.token).to.be.not.null;

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(200);
	});

	it('should handle invalid credentials by username', async () => {
		const requestBody = generateRequest({
			username: 'username04',
			password: 'password01',
		});

		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await login(requestBody, mockResponse);

		// Assert - response
		const response = mockResponse.json.getCall(0).args[0];
		expect(response.success).to.be.false;
		expect(response.token).to.be.undefined;
		expect(response.error).to.deep.equal('Invalid credentials');

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(400);
	});

	it('should handle invalid credentials by password', async () => {
		const requestBody = generateRequest({
			username: 'username01',
			password: 'password02',
		});

		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await login(requestBody, mockResponse);

		// Assert - response
		const response = mockResponse.json.getCall(0).args[0];
		expect(response.success).to.be.false;
		expect(response.token).to.be.undefined;
		expect(response.error).to.deep.equal('Invalid credentials');

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(401);
	});

	it('should handle missing username', async () => {
		const requestBody = generateRequest({
			password: 'password01',
		});

		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await login(requestBody, mockResponse);

		// Assert - response
		const response = mockResponse.json.getCall(0).args[0];
		expect(response.success).to.be.false;
		expect(response.token).to.be.undefined;
		expect(response.error).to.deep.equal(
			'Please provide an username and password'
		);

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(400);
	});

	it('should handle missing password', async () => {
		const requestBody = generateRequest({
			username: 'username01',
		});

		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await login(requestBody, mockResponse);

		// Assert - response
		const response = mockResponse.json.getCall(0).args[0];
		expect(response.success).to.be.false;
		expect(response.token).to.be.undefined;
		expect(response.error).to.deep.equal(
			'Please provide an username and password'
		);

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(400);
	});

	it('should log the user out and clear the cookie', async () => {
		// Action
		const mockResponse = {
			status: sinon.stub().returnsThis(),
			json: sinon.spy(),
			cookie: sinon.spy(),
		};
		await logout({}, mockResponse);

		// Assert
		const response = mockResponse.json.getCall(0).args[0];
		expect(response).to.deep.equal({
			success: true,
			data: {},
		});

		// Assert
		const actualCookie = mockResponse.cookie.getCall(0).args[0];
		expect(actualCookie.token).to.be.undefined;

		// Assert - status
		const actualStatus = mockResponse.status.getCall(0).args[0];
		expect(actualStatus).to.deep.equal(200);
	});
});
