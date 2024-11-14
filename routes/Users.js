const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, loginUser, authUser } = require("../controllers/usersController");
const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/", getAllUsers); // For admin purposes only

/**
 * @swagger
 * /auth/registration:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     description: This endpoint creates a new user with a specified role (teacher or student).
 *     operationId: createUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [teacher, student]
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request, invalid role
 *       500:
 *         description: Failed to create user
 */
router.post("/registration", createUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Authentication
 *     description: This endpoint allows users to log in by providing a username and password. If the login is successful, a JWT token is returned.
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *                 example: "yourUsername"
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: "yourPassword"
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for user authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                   example: "yourUsername"
 *                 id:
 *                   type: integer
 *                   description: ID of the user
 *                   example: 1
 *       '401':
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Wrong Username And Password Combination"
 *       '404':
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User Doesn't Exist"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get authenticated user information
 *     tags:
 *       - Authentication
 *     description: This endpoint returns information about the authenticated user based on the provided JWT token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the user
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                   example: "yourUsername"
 */
router.get("/user", validateToken, authUser);

module.exports = router;
