const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const { getUserDetail, updateUserDetails } = require("../controllers/usersController");
const upload = require("../middlewares/UploadMiddleware");

/**
 * @swagger
 * /user/details:
 *   get:
 *     summary: Get user details
 *     tags:
 *       - User
 *     description: Retrieve detailed information about the authenticated user. A valid access token is required.
 *     operationId: getUserDetail
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the user account.
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: The username of the authenticated user.
 *                   example: "john_doe"
 *                 role:
 *                   type: string
 *                   description: The role of the user (e.g., "admin", "student", "instructor").
 *                   example: "student"
 *                 userDetails:
 *                   type: object
 *                   description: Detailed information about the user.
 *                   properties:
 *                     address:
 *                       type: string
 *                       description: The address of the user.
 *                       example: "123 Main St, Springfield"
 *                     phoneNumber:
 *                       type: string
 *                       description: The phone number of the user.
 *                       example: "+1-234-567-890"
 *                     birthDate:
 *                       type: string
 *                       format: date
 *                       description: The birth date of the user.
 *                       example: "1995-08-15"
 *                     profilePictureURL:
 *                       type: string
 *                       description: URL to the user's profile picture.
 *                       example: "https://example.com/profile.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time when the user's details were created.
 *                       example: "2024-01-01T12:00:00Z"
 *       '404':
 *         description: User details not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User details not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/details", validateToken, getUserDetail);

/**
 * @swagger
 * /user/details:
 *   put:
 *     summary: Update user details
 *     tags:
 *       - User
 *     description: Update the authenticated user's details, including optional profile picture upload. A valid access token is required.
 *     operationId: updateUserDetails
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: The updated full name of the user.
 *                 example: "John Doe"
 *               address:
 *                 type: string
 *                 description: The updated address of the user.
 *                 example: "123 Main St, Springfield"
 *               phoneNumber:
 *                 type: string
 *                 description: The updated phone number of the user.
 *                 example: "+1-234-567-890"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: The updated birth date of the user in YYYY-MM-DD format.
 *                 example: "1995-08-15"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile picture for the user.
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated successfully"
 *                 userDetails:
 *                   type: object
 *                   description: Updated user details.
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       description: The full name of the user.
 *                       example: "John Doe"
 *                     address:
 *                       type: string
 *                       description: The address of the user.
 *                       example: "123 Main St, Springfield"
 *                     phoneNumber:
 *                       type: string
 *                       description: The phone number of the user.
 *                       example: "+1-234-567-890"
 *                     birthDate:
 *                       type: string
 *                       format: date
 *                       description: The birth date of the user.
 *                       example: "1995-08-15"
 *                     profilePictureURL:
 *                       type: string
 *                       description: URL of the user's profile picture.
 *                       example: "https://example.com/profile.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the user details were created.
 *                       example: "2024-01-01T12:00:00Z"
 *       '404':
 *         description: User details not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User details not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.put("/details", validateToken, upload.single("profilePicture"), updateUserDetails);


module.exports = router;