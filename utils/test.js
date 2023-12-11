const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const getCurrentData = async (entityModel, includeFields) => {
	const data = await entityModel.find();

	return data.map((item) => {
		const mappedItem = {};
		includeFields.forEach((field) => {
			mappedItem[field] = field === 'id' ? item._id.toString() : item[field];
		});
		return mappedItem;
	});
};
exports.getCurrentData = getCurrentData;

const mapIdToString = (data) => {
	if (Array.isArray(data)) {
		return data.map((item) => ({
			...item,
			id: item.id?.toString(),
		}));
	}
	return { ...data, id: data?.id?.toString() };
};

exports.generateRequest = (body = {}, params = {}) => ({
	body: body,
	params: params,
});

const generateSuccessResponse = (data) => {
	if (Array.isArray(data)) {
		return {
			success: true,
			count: data.length,
			data: data.sort((a, b) => a.name.localeCompare(b.name)),
		};
	}
	return { success: true, data: data };
};
exports.generateSuccessResponse = generateSuccessResponse;

const generateFailResponse = (message) => ({
	success: false,
	error: message,
});
exports.generateFailResponse = generateFailResponse;

const executeTest = async (
	controllerFunction,
	requestBody,
	expectedResponse,
	expectedStatus = 200,
	assertionCallback
) => {
	// Action
	const mockResponse = {
		status: sinon.stub().returnsThis(),
		json: sinon.spy(),
	};
	await controllerFunction(requestBody, mockResponse);

	// Assert - response
	const response = mockResponse.json.getCall(0).args[0];
	assertionCallback(response, expectedResponse);

	// Assert - status
	const actualStatus = mockResponse.status.getCall(0).args[0];
	expect(actualStatus).to.deep.equal(expectedStatus);
};

exports.executeGetTest = async (
	controllerFunction,
	requestBody,
	expectedResponse,
	expectedStatus = 200
) => {
	executeTest(
		controllerFunction,
		requestBody,
		expectedResponse,
		expectedStatus,
		(response, expected) => {
			const actualResponse =
				expectedStatus === 200 ? mapIdToString(response) : response;
			expect(actualResponse).to.deep.equal(expected);
		}
	);
};

exports.executeCreateTest = async (
	controllerFunction,
	entityModel,
	includeFields,
	requestBody,
	expectedStatus = 201,
	message = ''
) => {
	const beforeData = await getCurrentData(entityModel, includeFields);

	await executeTest(
		controllerFunction,
		requestBody,
		generateSuccessResponse(requestBody.body),
		expectedStatus,
		async (response) => {
			const afterData = await getCurrentData(entityModel, includeFields);
			if (expectedStatus === 201) {
				expect(afterData.length).to.equal(beforeData.length + 1);
				expect(afterData.find((item) => item.name === requestBody.body.name)).to
					.exist;
				expect(mapIdToString(response)).to.deep.equal(
					generateSuccessResponse(
						afterData.find((item) => item.name === requestBody.body.name)
					)
				);
			} else {
				expect(afterData).to.deep.equal(beforeData);
				expect(response).to.deep.equal(generateFailResponse(message));
			}
		}
	);
};

exports.executeUpdateTest = async (
	controllerFunction,
	entityModel,
	includeFields,
	requestBody,
	expectedStatus = 200,
	message = ''
) => {
	const dataBeforeUpdate = await getCurrentData(entityModel, includeFields);

	await executeTest(
		controllerFunction,
		requestBody,
		generateSuccessResponse(requestBody.params),
		expectedStatus,
		async (response) => {
			const dataAfterUpdate = await getCurrentData(entityModel, includeFields);
			if (expectedStatus === 200) {
				expect(dataAfterUpdate.length).to.equal(dataBeforeUpdate.length);
				expect(
					dataAfterUpdate.find((item) => item.id === requestBody.params.id)
				).to.exist;
				expect(mapIdToString(response)).to.deep.equal(
					generateSuccessResponse(
						dataAfterUpdate.find((item) => item.id === requestBody.params.id)
					)
				);
			} else {
				expect(dataAfterUpdate).to.deep.equal(dataBeforeUpdate);
				expect(response).to.deep.equal(generateFailResponse(message));
			}
		}
	);
};

exports.executeDeleteTest = async (
	controllerFunction,
	entityModel,
	includeFields,
	requestBody,
	expectedStatus = 200,
	message = ''
) => {
	const dataBeforeDeletion = await getCurrentData(entityModel, includeFields);

	await executeTest(
		controllerFunction,
		requestBody,
		generateSuccessResponse({}),
		expectedStatus,
		async (response) => {
			const dataAfterDeletion = await getCurrentData(
				entityModel,
				includeFields
			);
			if (expectedStatus === 200) {
				expect(dataAfterDeletion.length).to.equal(
					dataBeforeDeletion.length - 1
				);
				expect(
					dataAfterDeletion.find((item) => item.id === requestBody.params.id)
				).to.not.exist;
				expect(response).to.deep.equal(generateSuccessResponse({}));
			} else {
				expect(dataAfterDeletion).to.deep.equal(dataBeforeDeletion);
				expect(response).to.deep.equal(generateFailResponse(message));
			}
		}
	);
};
