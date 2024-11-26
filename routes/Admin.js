const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  authUser,
  getAllUsersWithDetails,
  adminUpdateUserDetails,
  getUserDetailsById,
  deleteUser,
  createUser,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCourseDetailsWithVideos,
  deleteVideo,
  getPendingCourses,
  getPendingVideos,
  approveCourse,
  approveVideo,
  rejectCourse,
  rejectVideo,
} = require("../controllers/adminController");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");


// Admin authentication
router.post("/login", loginAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags:
 *       - Admin
 *     description: Login as an admin using a username and password. A JWT token is returned upon successful login.
 *     operationId: loginAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the admin.
 *                 example: "adminUser"
 *               password:
 *                 type: string
 *                 description: The password for the admin account.
 *                 example: "adminPassword123"
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for admin authentication.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 fullName:
 *                   type: string
 *                   description: The full name or username of the admin.
 *                   example: "adminUser"
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the admin.
 *                   example: 1
 *                 role:
 *                   type: string
 *                   description: The role of the user (admin).
 *                   example: "admin"
 *       '400':
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Username and password are required"
 *       '404':
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Admin doesn't exist"
 *       '401':
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect password"
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
router.post("/login", loginAdmin);

/**
 * @swagger
 * /admin/auth:
 *   get:
 *     summary: Get authenticated admin details
 *     tags:
 *       - Admin
 *     description: This endpoint retrieves the details of the authenticated admin. A valid admin token must be provided in the Authorization header.
 *     operationId: authUser
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the authenticated admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the admin.
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: The username of the authenticated admin.
 *                   example: "adminUser"
 *                 role:
 *                   type: string
 *                   description: The role of the authenticated user (admin).
 *                   example: "admin"
 *       '401':
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
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

router.get("/auth", validateAdminToken, authUser);

// User management
router.get("/users/details", validateAdminToken, getAllUsersWithDetails);
router.put("/update-user/:id", validateAdminToken, adminUpdateUserDetails);
router.get("/users/details/:id", validateAdminToken, getUserDetailsById);
router.delete("/users/:id", validateAdminToken, deleteUser);
router.post("/create-user", validateAdminToken, createUser);

// Course management
router.get("/courses", validateAdminToken, getAllCourses);
router.get("/courses/:id", validateAdminToken, getCourseById);
router.post("/courses", validateAdminToken, createCourse);
router.put("/courses/:id", validateAdminToken, updateCourse);
router.delete("/courses/:id", validateAdminToken, deleteCourse);
router.patch("/courses/:id/status", validateAdminToken, updateCourseStatus);
router.get("/courses/:id/details", validateAdminToken, getCourseDetailsWithVideos);

// Video management
router.delete("/videos/:id", validateAdminToken, deleteVideo);

// Approvals and Rejections
// Approvals
router.get("/pending-courses", validateAdminToken, getPendingCourses);
router.get("/pending-videos", validateAdminToken, getPendingVideos);
router.patch("/courses/:id/approve", validateAdminToken, approveCourse);
router.patch("/videos/:id/approve", validateAdminToken, approveVideo);
//Rejections
router.patch("/courses/:id/reject", validateAdminToken, rejectCourse);
router.patch("/videos/:id/reject", validateAdminToken, rejectVideo);

module.exports = router;
