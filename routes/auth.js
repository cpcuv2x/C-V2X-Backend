const express = require('express');
const { login, logout } = require('../controllers/auth');

const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: The authentication managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         role:
 *           type: string
 *           enum:
 *             - driver
 *             - admin
 *           description: The role of the user. Should be either 'driver' or 'admin'.
 *         driver_id:
 *           type: string
 *           description: The ID of the associated driver. (Optional)
 *         resetPasswordToken:
 *           type: string
 *           description: Token for resetting the password.
 *         resetPasswordExpire:
 *           type: string
 *           format: date-time
 *           description: The expiration date and time of the password reset token.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created.
 *       required:
 *         - username
 *         - password
 *         - role
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user by providing a username and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             username: "john_doe"
 *             password: "secret123"
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       '200':
 *         description: Authentication successful. Returns a token.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjE2MjI5Y2FmMGEzZTc4OGNhMzM3YzI2IiwiaWF0IjoxNjM5NjQ3NTEzLCJleHAiOjE2Mzk2NTA3MTN9.HvJn-HC5wDS13ZLlR-8O_VzxFTQxH0T0TZp86SsRuzQ"
 *       '400':
 *         description: An error response if there's an issue with the request.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Please provide a username and password"
 *       '401':
 *         description: Unauthorized. Invalid credentials.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid credentials"
 */

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Log user out / clear cookie
 *     description: Logs the user out by clearing the 'token' cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User successfully logged out.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: {}
 *       '401':
 *         description: Unauthorized. User not logged in.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Unauthorized"
 */
