const express = require('express');
const {
	getEmergencies,
	createEmergency,
	updateEmergency,
} = require('../controllers/emergencies');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
	.route('/')
	.get(getEmergencies)
	.post(protect, authorize('driver'), createEmergency);
router.route('/:id').put(updateEmergency);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Emergencies
 *  description: The Emergencies managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Emergency:
 *       type: object
 *       properties:
 *         car_id:
 *           type: string
 *           description: The unique identifier of the associated car.
 *         status:
 *           type: string
 *           description: The status of the emergency (e.g., "pending").
 *         latitude:
 *           type: number
 *           description: The latitude coordinate associated with the emergency.
 *         longitude:
 *           type: number
 *           description: The longitude coordinate associated with the emergency.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp indicating when the emergency was created.
 */

/**
 * @swagger
 * /api/emergencies:
 *   get:
 *     summary: Get all Emergencies
 *     description: Retrieve a list of all emergencies with additional information about the associated car and driver.
 *     tags:
 *       - Emergencies
 *     responses:
 *       '200':
 *         description: A list of emergencies with car and driver details.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "5fe5b4a27f6e4f001f4fcf79"
 *                   status: "pending"
 *                   car_name: "Car1"
 *                   driver_phone_no: "123-456-7890"
 *                   time: "03:30 pm"
 *                 - id: "5fe5b4a27f6e4f001f4fcf83"
 *                   status: "pending"
 *                   car_name: "Car2"
 *                   driver_phone_no: ""
 *                   time: "08:45 am"
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
 * /api/emergencies:
 *   post:
 *     summary: Create new emergency
 *     description: Create a new emergency record with details such as car_id, status, latitude, and longitude.
 *     tags:
 *       - Emergencies
 *     parameters:
 *       - in: query
 *         name: car_id
 *         schema:
 *           type: string
 *         description: The ID of the car involved in the emergency.
 *         required: true
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: The status of the emergency (pending, inProgress, complete).
 *         example: "pending"
 *         required: true
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: The latitude coordinates of the emergency location.
 *         example: 40.7128
 *         required: true
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: The longitude coordinates of the emergency location.
 *         example: 74.0060
 *         required: true
 *     responses:
 *       '201':
 *         description: A new emergency record is created successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf88"
 *                 car_id: "5fe5b4a27f6e4f001f4fcf79"
 *                 status: "pending"
 *                 latitude: 40.7128
 *                 longitude: 74.0060
 *       '400':
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "Please add a car_id"
 *                 - "Status should be pending, inProgress or complete"
 *                 - "Latitude should be number"
 *                 - "Longitude should be number"
 *       '404':
 *         description: An error response if the specified car is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The car not found"
 */

/**
 * @swagger
 * /api/emergencies/{id}:
 *   put:
 *     summary: Update emergency
 *     description: Update an existing emergency record with details such as car_id, status, latitude, and longitude.
 *     tags:
 *       - Emergencies
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: The ID of the emergency record to be updated.
 *         required: true
 *       - in: query
 *         name: car_id
 *         schema:
 *           type: string
 *         description: The ID of the car involved in the emergency.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: The status of the emergency (pending, inProgress, complete).
 *         example: "pending"
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: The latitude coordinates of the emergency location.
 *         example: 40.7128
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: The longitude coordinates of the emergency location.
 *         example: 74.0060
 *     responses:
 *       '200':
 *         description: The emergency record is updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf88"
 *                 car_id: "5fe5b4a27f6e4f001f4fcf79"
 *                 status: "pending"
 *                 latitude: 40.7128
 *                 longitude: 74.0060
 *       '400':
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "Status should be pending, inProgress or complete"
 *                 - "Latitude should be number"
 *                 - "Longitude should be number"
 *       '404':
 *         description: An error response if the specified car or emergency record is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "The car not found"
 *                 - "The emergency not found"
 */
