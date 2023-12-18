const express = require('express');
const {
	getCars,
	getCarsList,
	getCar,
	createCar,
	updateCar,
	deleteCar,
} = require('../controllers/cars');

const router = express.Router();

router.route('/').put(getCars).post(createCar);
router.route('/list').get(getCarsList);
router.route('/:id').get(getCar).put(updateCar).delete(deleteCar);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Cars
 *  description: The Cars managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the car.
 *         license_plate:
 *           type: string
 *           description: The license plate of the car.
 *         model:
 *           type: string
 *           description: The model of the car.
 *         driver_id:
 *           type: string
 *           description: The unique identifier of the associated driver.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp indicating when the car was created.
 */

/**
 * @swagger
 * /api/cars:
 *   put:
 *     summary: Get cars based on filters
 *     description: Retrieve a list of all cars with optional filters.
 *     tags:
 *       - Cars
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             id: "5fe5b4a27f6e4f001f4fcf79"
 *             name: "Car1"
 *             license_plate: "ABC123"
 *             model: "Model1"
 *             driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *             front_cam_id: "5fe5b4a27f6e4f001f4fcf81"
 *             back_cam_id: "5fe5b4a27f6e4f001f4fcf82"
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               model:
 *                 type: string
 *               driver_id:
 *                 type: string
 *               front_cam_id:
 *                 type: string
 *               back_cam_id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A list of cars based on the provided filters.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "5fe5b4a27f6e4f001f4fcf79"
 *                   name: "Car1"
 *                   license_plate: "ABC123"
 *                   model: "Model1"
 *                   driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *                   driver: "John Doe"
 *                   cameras:
 *                     - id: "5fe5b4a27f6e4f001f4fcf81"
 *                       name: "Camera1"
 *                       position: "Front"
 *                     - id: "5fe5b4a27f6e4f001f4fcf82"
 *                       name: "Camera2"
 *                       position: "Back"
 *                 - id: "5fe5b4a27f6e4f001f4fcf83"
 *                   name: "Car2"
 *                   license_plate: "XYZ789"
 *                   model: "Model2"
 *                   driver_id: "5fe5b4a27f6e4f001f4fcf84"
 *                   driver: "Jane Doe"
 *                   cameras:
 *                     - id: "5fe5b4a27f6e4f001f4fcf85"
 *                       name: "Camera3"
 *                       position: "Front"
 *                     - id: "5fe5b4a27f6e4f001f4fcf86"
 *                       name: "Camera4"
 *                       position: "Back"
 *       '400':
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 */

/**
 * @swagger
 * /api/cars/list:
 *   get:
 *     summary: Get all cars list
 *     description: Retrieve a list of all cars with minimal details.
 *     tags:
 *       - Cars
 *     responses:
 *       '200':
 *         description: A list of cars with minimal details.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "5fe5b4a27f6e4f001f4fcf79"
 *                   name: "Car1"
 *                 - id: "5fe5b4a27f6e4f001f4fcf83"
 *                   name: "Car2"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 */

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a single car
 *     description: Retrieve details of a specific car by ID.
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Details of the specified car.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf79"
 *                 name: "Car1"
 *                 license_plate: "ABC123"
 *                 model: "Model1"
 *                 driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *                 driver: "John Doe"
 *                 cameras:
 *                   - id: "5fe5b4a27f6e4f001f4fcf81"
 *                     name: "Camera1"
 *                     position: "Front"
 *                   - id: "5fe5b4a27f6e4f001f4fcf82"
 *                     name: "Camera2"
 *                     position: "Back"
 *       '404':
 *         description: An error response when the car is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The car not found"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 */

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     description: Create a new car with the provided information.
 *     tags:
 *       - Cars
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Car1"
 *             license_plate: "ABC123"
 *             model: "Model1"
 *             driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               model:
 *                 type: string
 *               driver_id:
 *                 type: string
 *             required:
 *               - name
 *               - license_plate
 *               - model
 *     responses:
 *       '201':
 *         description: Details of the created car.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf79"
 *                 name: "Car1"
 *                 license_plate: "ABC123"
 *                 model: "Model1"
 *                 driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *       '400':
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "Please add a name"
 *                 - "Please add a license_plate"
 *                 - "Please add a model"
 *                 - "Name should not contain spaces"
 *                 - "Name already exists"
 *       '404':
 *         description: An error response when the driver is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The driver not found"
 */

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car by ID
 *     description: Update details of a specific car by ID.
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to be updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: "Car1"
 *             license_plate: "ABC123"
 *             model: "Model1"
 *             driver_id: "5fe5b4a27f6e4f001f4fcf80"
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               model:
 *                 type: string
 *               driver_id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Details of the updated car.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf79"
 *                 name: "UpdatedCar1"
 *                 license_plate: "UpdatedABC123"
 *                 model: "UpdatedModel1"
 *                 driver_id: "5fe5b4a27f6e4f001f4fcf81"
 *       '404':
 *         description: An error response when the driver or car is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "The driver not found"
 *                 - "The car not found"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 *               details:
 *                 - "Name should not contain spaces"
 *                 - "Name already exists"
 */

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     description: Delete a specific car by ID, along with associated cameras and emergencies.
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the car to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Success response when the car is deleted.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: {}
 *       '404':
 *         description: An error response when the car is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The car not found"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 */
