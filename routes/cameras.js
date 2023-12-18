const express = require('express');
const {
	getCameras,
	getCamerasList,
	getCamera,
	createCamera,
	updateCamera,
	deleteCamera,
} = require('../controllers/cameras');

const router = express.Router();

router.route('/').put(getCameras).post(createCamera);
router.route('/list').get(getCamerasList);
router.route('/:id').get(getCamera).put(updateCamera).delete(deleteCamera);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Cameras
 *  description: The Cameras managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Camera:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the camera.
 *         position:
 *           type: string
 *           description: The position of the camera.
 *         car_id:
 *           type: string
 *           description: The unique identifier of the associated car.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp indicating when the camera was created.
 */

/**
 * @swagger
 * /api/cameras:
 *   put:
 *     summary: Get cameras based on filters
 *     description: Retrieve a list of all cameras with optional filters.
 *     tags:
 *       - Cameras
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             id: "5fe5b4a27f6e4f001f4fcf81"
 *             name: "Camera1"
 *             position: "Front"
 *             car_id: "5fe5b4a27f6e4f001f4fcf79"
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               car_id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A list of cameras based on the provided filters.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "5fe5b4a27f6e4f001f4fcf81"
 *                   name: "Camera1"
 *                   position: "Front"
 *                   car_id: "5fe5b4a27f6e4f001f4fcf79"
 *                   car: "Car1"
 *                 - id: "5fe5b4a27f6e4f001f4fcf82"
 *                   name: "Camera2"
 *                   position: "Back"
 *                   car_id: "5fe5b4a27f6e4f001f4fcf79"
 *                   car: "Car1"
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
 * /api/cameras/list:
 *   get:
 *     summary: Get all cameras list
 *     description: Retrieve a list of all cameras with basic information.
 *     tags:
 *       - Cameras
 *     responses:
 *       '200':
 *         description: A list of cameras with basic information.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "5fe5b4a27f6e4f001f4fcf81"
 *                   name: "Camera1"
 *                 - id: "5fe5b4a27f6e4f001f4fcf82"
 *                   name: "Camera2"
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
 * /api/cameras/{id}:
 *   get:
 *     summary: Get single camera
 *     description: Retrieve details of a specific camera by ID.
 *     tags:
 *       - Cameras
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the camera to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Details of the specified camera.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf81"
 *                 name: "Camera1"
 *                 position: "Front"
 *                 car_id: "5fe5b4a27f6e4f001f4fcf79"
 *                 car: "Car1"
 *       '404':
 *         description: An error response when the camera is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The camera not found"
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
 * /api/cameras:
 *   post:
 *     summary: Create new camera
 *     description: Create a new camera with the provided information.
 *     tags:
 *       - Cameras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Camera1"
 *             position: "Front"
 *             car_id: "5fe5b4a27f6e4f001f4fcf79"
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               car_id:
 *                 type: string
 *             required:
 *               - name
 *               - position
 *               - car_id
 *     responses:
 *       '201':
 *         description: Details of the created camera.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf81"
 *                 name: "Camera1"
 *                 position: "Front"
 *                 car_id: "5fe5b4a27f6e4f001f4fcf79"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "Please add a name"
 *                 - "Please add a car_id"
 *                 - "Please add a position"
 *                 - "Name should not contain spaces"
 *                 - "Name already exists"
 *                 - "Position should be Front or Back"
 *                 - "Position of the car already exists"
 *       '404':
 *         description: An error response if the car is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The car not found"
 */

/**
 * @swagger
 * /api/cameras/{id}:
 *   put:
 *     summary: Update camera
 *     description: Update details of an existing camera with the provided information.
 *     tags:
 *       - Cameras
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the camera to be updated.
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: "Camera1"
 *             position: "Front"
 *             car_id: "5fe5b4a27f6e4f001f4fcf79"
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               car_id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Details of the updated camera.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "5fe5b4a27f6e4f001f4fcf81"
 *                 name: "UpdatedCamera"
 *                 position: "Back"
 *                 car_id: "5fe5b4a27f6e4f001f4fcf79"
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "Name should not contain spaces"
 *                 - "Name already exists"
 *                 - "Position should be Front or Back"
 *                 - "Position of the car already exists"
 *       '404':
 *         description: An error response if the car or camera is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 - "The car not found"
 *                 - "The camera not found"
 */

/**
 * @swagger
 * /api/cameras/{id}:
 *   delete:
 *     summary: Delete camera
 *     description: Delete a camera with the provided unique identifier.
 *     tags:
 *       - Cameras
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the camera to be deleted.
 *     responses:
 *       '200':
 *         description: Success message after deleting the camera.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: {}
 *       '400':
 *         description: An error response with details.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters"
 *       '404':
 *         description: An error response if the camera is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The camera not found"
 */
