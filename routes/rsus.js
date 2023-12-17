const express = require('express');
const {
	getRSUs,
	getRSUsList,
	getRSU,
	createRSU,
	updateRSU,
	deleteRSU,
} = require('../controllers/rsus');

const router = express.Router();

router.route('/').put(getRSUs).post(createRSU);
router.route('/list').get(getRSUsList);
router.route('/:id').get(getRSU).put(updateRSU).delete(deleteRSU);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: RSUs
 *  description: The RSUs managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RSU:
 *       type: object
 *       required:
 *         - name
 *         - recommended_speed
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the RSU.
 *         recommended_speed:
 *           type: string
 *           description: The recommended speed of the RSU.
 *       example:
 *         name: RSU1
 *         recommended_speed: 50
 */

/**
 * @swagger
 * /api/rsus:
 *   put:
 *     summary: Get RSUs based on filters
 *     description: Get RSUs based on optional filters such as ID, name, and recommended speed.
 *     tags:
 *       - RSUs
 *     parameters:
 *       - in: query
 *         name: id
 *         description: Filter RSUs by ID.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         description: Filter RSUs by name.
 *         required: false
 *         schema:
 *           type: string
 *         example: "RSU1"
 *       - in: query
 *         name: recommended_speed
 *         description: Filter RSUs by recommended speed.
 *         required: false
 *         schema:
 *           type: string
 *         example: "50"
 *     responses:
 *       200:
 *         description: A list of RSUs based on the provided filters.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "123"
 *                   name: "RSU1"
 *                   recommended_speed: "50"
 *                 - id: "456"
 *                   name: "RSU2"
 *                   recommended_speed: "60"
 *       400:
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters."
 */

/**
 * @swagger
 * /api/rsus/list:
 *   get:
 *     summary: Get a list of all RSUs
 *     description: Get a list of all RSUs with minimal details.
 *     tags:
 *       - RSUs
 *     responses:
 *       200:
 *         description: A list of all RSUs with minimal details.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "123"
 *                   name: "RSU1"
 *                 - id: "456"
 *                   name: "RSU2"
 *       400:
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters."
 */

/**
 * @swagger
 * /api/rsus/{id}:
 *   get:
 *     summary: Get a single RSU by ID
 *     description: Get detailed information about a single RSU using its ID.
 *     tags:
 *       - RSUs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the RSU to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed information about the requested RSU.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "123"
 *                 name: "RSU1"
 *                 recommended_speed: "60"
 *       404:
 *         description: An error response if the requested RSU is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The RSU not found."
 *       400:
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters."
 */

/**
 * @swagger
 * /api/rsus:
 *   post:
 *     summary: Create a new RSU
 *     description: Create a new RSU with the provided information.
 *     tags:
 *       - RSUs
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: Name of the RSU.
 *         schema:
 *           type: string
 *         example: RSU1
 *       - in: query
 *         name: recommended_speed
 *         required: true
 *         description: Recommended speed of the RSU.
 *         schema:
 *           type: string
 *         example: "60"
 *     responses:
 *       201:
 *         description: The newly created RSU.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "123"
 *                 name: "RSU1"
 *                 recommended_speed: "60"
 *       400:
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters."
 *               details:
 *                 - "Please add a name."
 *                 - "Please add a recommended speed."
 *                 - "Name should not contain spaces."
 *                 - "Recommended speed should be a valid number."
 *                 - "Name already exists."
 */

/**
 * @swagger
 * /api/rsus/{id}:
 *   put:
 *     summary: Update an existing RSU
 *     description: Update an existing RSU with the provided information.
 *     tags:
 *       - RSUs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the RSU to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: UpdatedRSU
 *             recommended_speed: "75"
 *     responses:
 *       200:
 *         description: The updated RSU.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "123"
 *                 name: "UpdatedRSU"
 *                 recommended_speed: "75"
 *       400:
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid request parameters."
 *               details:
 *                 - "Name should not contain spaces."
 *                 - "Recommended speed should be a valid number."
 *                 - "Name already exists."
 *       404:
 *         description: An error response if the RSU with the specified ID is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The RSU not found."
 */

/**
 * @swagger
 * /api/rsus/{id}:
 *   delete:
 *     summary: Delete an existing RSU
 *     description: Delete an existing RSU with the specified ID.
 *     tags:
 *       - RSUs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the RSU to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful deletion of the RSU.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: {}
 *       404:
 *         description: An error response if the RSU with the specified ID is not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "The RSU not found."
 */
