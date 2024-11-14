const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const { getUserDetail } = require("../controllers/usersController");

/**
 * @swagger
 * /details:
 *   get:
 *     summary: Get detailed information of the authenticated user
 *     tags:
 *       - User
 *     description: This endpoint retrieves detailed information about the authenticated user based on the provided JWT token.
 *     security:
 *       - bearerAuth: []
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
 *                   description: ID of the authenticated user
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: Username of the authenticated user
 *                   example: "yourUsername"
 *                 role:
 *                   type: string
 *                   description: Role of the authenticated user
 *                   example: "user"
 *                 userDetails:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                       description: Address of the user
 *                       example: "123 Main St, Hometown, Country"
 *                     phoneNumber:
 *                       type: string
 *                       description: Phone number of the user
 *                       example: "+1234567890"
 *                     birthDate:
 *                       type: string
 *                       format: date
 *                       description: Birth date of the user
 *                       example: "1990-01-01"
 *                     profilePictureURL:
 *                       type: string
 *                       description: URL of the user's profile picture
 *                       example: "https://example.com/profile.jpg"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date when the user details were created
 *                       example: "2024-11-01T00:00:00Z"
 *       '404':
 *         description: User details not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
 *                   description: Error message
 *                   example: "Internal server error"
 */
router.get("/details", validateToken, getUserDetail);

module.exports = router;