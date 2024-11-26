const express = require("express");
const router = express.Router();
const { getEnrolledCourses, enrollInCourse, checkEnrollment, getAllEnrollments  } = require("../controllers/enrollmentController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

/**
 * @swagger
 * /enrollment/enrolled:
 *   get:
 *     summary: Get all enrolled courses for a student
 *     tags:
 *       - Enrollment
 *     description: Retrieve all courses that the authenticated student is enrolled in. A valid access token is required.
 *     operationId: getEnrolledCourses
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: integer
 *                     description: The ID of the enrolled course.
 *                     example: 1
 *                   courseTitle:
 *                     type: string
 *                     description: The title of the enrolled course.
 *                     example: "Introduction to JavaScript"
 *                   courseDesc:
 *                     type: string
 *                     description: The description of the enrolled course.
 *                     example: "Learn the basics of JavaScript programming."
 *                   thumbnail:
 *                     type: string
 *                     description: URL of the course thumbnail image.
 *                     example: "https://example.com/thumbnails/course-thumbnail.jpg"
 *       '404':
 *         description: No enrolled courses found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No enrolled courses found."
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
router.get("/enrolled", validateToken, getEnrolledCourses);

/**
 * @swagger
 * /enrollment/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags:
 *       - Enrollment
 *     description: Enroll the authenticated student in a course. A valid access token is required.
 *     operationId: enrollInCourse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: integer
 *                 description: The ID of the course the student wants to enroll in.
 *                 example: 1
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '201':
 *         description: Successfully enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully enrolled in the course."
 *                 enrollment:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       description: The ID of the student enrolling.
 *                       example: 123
 *                     courseId:
 *                       type: integer
 *                       description: The ID of the course the student is enrolled in.
 *                       example: 1
 *       '400':
 *         description: Already enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are already enrolled in this course."
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
router.post("/enroll", validateToken, enrollInCourse);

/**
 * @swagger
 * /enrollment/check-enrollment/{courseId}:
 *   get:
 *     summary: Check if the student is enrolled in a course
 *     tags:
 *       - Enrollment
 *     description: Check if the authenticated student is enrolled in a specific course. A valid access token is required.
 *     operationId: checkEnrollment
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to check enrollment for.
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Enrollment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrolled:
 *                   type: boolean
 *                   description: Whether the student is enrolled in the course.
 *                   example: true
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
router.get("/check-enrollment/:courseId", validateToken, checkEnrollment);

router.get("/", getAllEnrollments);

module.exports = router;