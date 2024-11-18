const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  loginUser,
  authUser,
  sendEmailVerification,
  verifyCode,
  checkDuplicate,
  sendResetCode,
  verifyResetCode,
  resetPassword
} = require("../controllers/usersController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const rateLimit = require("express-rate-limit");

const emailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 10, // Tối đa 3 yêu cầu trong 5 phút
  message: { error: "Too many requests, please try again later." },
});

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     description: Retrieve a list of all registered users. This endpoint is for admin purposes only.
 *     operationId: getAllUsers
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the user
 *                     example: 1
 *                   username:
 *                     type: string
 *                     description: The username of the user
 *                     example: "exampleUser"
 *                   email:
 *                     type: string
 *                     description: The email address of the user
 *                     example: "example@example.com"
 *                   role:
 *                     type: string
 *                     description: The role of the user (e.g., "student" or "instructor")
 *                     example: "student"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the user was created
 *                     example: "2024-11-18T12:34:56Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the user was last updated
 *                     example: "2024-11-18T12:34:56Z"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.get("/", getAllUsers); // For admin purposes only

/**
 * @swagger
 * /auth/registration:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     description: This endpoint creates a new user account with the specified details. The role must be either "instructor" or "student".
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
 *                 description: The username for the new account.
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: The password for the new account.
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 description: The email address for the new account.
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 description: The role of the user. Must be either "instructor" or "student".
 *                 enum:
 *                   - instructor
 *                   - student
 *                 example: "student"
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: "123-456-7890"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: The birth date of the user in YYYY-MM-DD format.
 *                 example: "1990-01-01"
 *     responses:
 *       '200':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User created successfully"
 *       '400':
 *         description: Bad request due to invalid input or duplicate username/email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Username or email already exists"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create user"
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
 *                 example: "exampleUser"
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: "examplePassword"
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
 *                 fullName:
 *                   type: string
 *                   description: Full name of the user
 *                   example: "John Doe"
 *                 role:
 *                   type: string
 *                   description: Role of the user
 *                   example: "admin"
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
 *     summary: Get authenticated user details
 *     tags:
 *       - User
 *     description: This endpoint retrieves the details of the authenticated user. A valid token must be provided in the `accessToken` header.
 *     operationId: authUser
 *     security:
 *       - accessTokenAuth: [] # Sử dụng accessTokenAuth thay cho bearerAuth
 *     responses:
 *       '200':
 *         description: Authenticated user details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the authenticated user
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: Username of the authenticated user
 *                   example: "exampleUser"
 *                 role:
 *                   type: string
 *                   description: Role of the authenticated user
 *                   example: "admin"
 *                 fullName:
 *                   type: string
 *                   description: Full name of the authenticated user
 *                   example: "John Doe"
 *       '401':
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not logged in!"
 *       '403':
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Token!"
 */
router.get("/user", validateToken, authUser);

/**
 * @swagger
 * /auth/send-email:
 *   post:
 *     summary: Send email verification code
 *     tags:
 *       - Email
 *     description: This endpoint sends a verification code to the provided email address. The code is valid for 10 minutes.
 *     operationId: sendEmailVerification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to which the verification code will be sent.
 *                 example: "example@example.com"
 *     responses:
 *       '200':
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification code sent successfully."
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required."
 *       '429':
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Too many requests. Please try again later."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send verification email."
 */
router.post("/send-email", emailLimiter, sendEmailVerification);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify email verification code
 *     tags:
 *       - Email
 *     description: This endpoint verifies the code sent to the user's email. If the code is valid and matches the stored code, the verification is successful.
 *     operationId: verifyCode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address associated with the verification code.
 *                 example: "example@example.com"
 *               code:
 *                 type: string
 *                 description: The verification code sent to the email.
 *                 example: "12345"
 *     responses:
 *       '200':
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification successful."
 *       '400':
 *         description: Bad request or invalid/expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired verification code."
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
router.post("/verify-code", verifyCode);

/**
 * @swagger
 * /auth/check-duplicate:
 *   post:
 *     summary: Check for duplicate username or email
 *     tags:
 *       - User
 *     description: This endpoint checks if a given username or email already exists in the database.
 *     operationId: checkDuplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username to check for duplication.
 *                 example: "exampleUsername"
 *               email:
 *                 type: string
 *                 description: The email to check for duplication.
 *                 example: "example@example.com"
 *     responses:
 *       '200':
 *         description: Username and email are available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username and email are available"
 *       '400':
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Username or email already exists"
 *       '500':
 *         description: Failed to check duplication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to check duplication"
 */
router.post("/check-duplicate", checkDuplicate);

/**
 * @swagger
 * /auth/send-reset-code:
 *   post:
 *     summary: Send password reset verification code
 *     tags:
 *       - Password Reset
 *     description: This endpoint sends a password reset verification code to the provided email address. The code is valid for 10 minutes.
 *     operationId: sendResetCode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to send the password reset verification code.
 *                 example: "example@example.com"
 *     responses:
 *       '200':
 *         description: Password reset code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset code sent successfully."
 *       '400':
 *         description: Email is required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required."
 *       '500':
 *         description: Failed to send password reset email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send password reset email."
 */
router.post("/send-reset-code", sendResetCode);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     tags:
 *       - Password Reset
 *     description: This endpoint verifies the password reset code sent to the user's email. If the code is valid, the verification is successful.
 *     operationId: verifyResetCode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address associated with the password reset code.
 *                 example: "example@example.com"
 *               code:
 *                 type: string
 *                 description: The password reset verification code sent to the email.
 *                 example: "12345"
 *     responses:
 *       '200':
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification successful."
 *       '400':
 *         description: Invalid or expired verification code or missing email/code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired verification code."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to verify reset code."
 */
router.post("/verify-reset-code", verifyResetCode);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Password Reset
 *     description: This endpoint resets the password for a user account. The email and new password must be provided.
 *     operationId: resetPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user resetting the password.
 *                 example: "example@example.com"
 *               password:
 *                 type: string
 *                 description: The new password for the user account.
 *                 example: "newSecurePassword123"
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully."
 *       '400':
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email and password are required."
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       '500':
 *         description: Failed to reset password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to reset password."
 */
router.post("/reset-password", resetPassword);

module.exports = router;
