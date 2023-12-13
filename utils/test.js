const sinon = require('sinon');
const mongoose = require('mongoose');
const chai = require('chai');
const { getCars } = require('../controllers/cars');
const expect = chai.expect;

const getCurrentData = async (entityModel, includeFields) => {
	const data = await entityModel.find();

	return data.map((item) => {
		const mappedItem = {};
		includeFields.forEach((field) => {
			mappedItem[field] =
				field === 'id'
					? item._id.toString()
					: item[field]
					? item[field].toString()
					: item[field];
		});
		return mappedItem;
	});
};
exports.getCurrentData = getCurrentData;

const mapPropToString = (res) => {
	if (res.hasOwnProperty('data')) {
		return { ...res, data: mapPropToString(res.data) };
	}
	if (Array.isArray(res)) {
		return res.map((item) => {
			const mappedItem = {};
			const objItem =
				item instanceof mongoose.Document ? item.toObject() : item;
			Object.keys(objItem).forEach((field) => {
				mappedItem[field] = Array.isArray(objItem[field])
					? mapPropToString(objItem[field])
					: objItem[field]
					? objItem[field].toString()
					: objItem[field];
			});
			return mappedItem;
		});
	}
	const mappedRes = {};
	const objRes = res instanceof mongoose.Document ? res.toObject() : res;
	Object.keys(objRes).forEach((field) => {
		mappedRes[field] = Array.isArray(objRes[field])
			? mapPropToString(objRes[field])
			: objRes[field]
			? objRes[field].toString()
			: objRes[field];
	});
	return mappedRes;
};

exports.generateRequest = (body = {}, params = {}) => ({
	body: body,
	params: params,
});

const generateSuccessResponse = (data) => {
	if (Array.isArray(data)) {
		const sortedData = data
			.map((item) => {
				if (!item.hasOwnProperty('name')) {
					item.name = `${item.first_name} ${item.last_name}`;
				}
				return item;
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		return {
			success: true,
			count: sortedData.length,
			data: sortedData,
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
	await assertionCallback(response, expectedResponse);

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
	await executeTest(
		controllerFunction,
		requestBody,
		expectedResponse,
		expectedStatus,
		async (response, expected) => {
			const actualResponse =
				expectedStatus === 200 ? mapPropToString(response) : response;
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
				const createdItem = () => {
					const item = afterData.find((item) => {
						if (!item.hasOwnProperty('name')) {
							return (
								item.first_name === requestBody.body.first_name &&
								item.last_name === requestBody.body.last_name
							);
						} else {
							return item.name === requestBody.body.name;
						}
					});
					if (item.hasOwnProperty('password')) {
						const { password, ...rest } = item;
						return {
							...rest,
							name: `${rest.first_name} ${rest.last_name}`,
						};
					}
					return item;
				};
				expect(afterData.length).to.equal(beforeData.length + 1);
				expect(createdItem()).to.exist;
				expect(mapPropToString(response)).to.deep.equal(
					generateSuccessResponse(createdItem())
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
				const updatedItem = () => {
					const item = dataAfterUpdate.find(
						(item) => item.id.toString() === requestBody.params.id
					);
					if (item.hasOwnProperty('password')) {
						const { password, ...rest } = item;
						return {
							...rest,
							name: `${rest.first_name} ${rest.last_name}`,
						};
					}
					return item;
				};
				expect(dataAfterUpdate.length).to.equal(dataBeforeUpdate.length);
				expect(updatedItem()).to.exist;
				expect(mapPropToString(response)).to.deep.equal(
					generateSuccessResponse(updatedItem())
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
