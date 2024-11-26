const express = require("express");
const router = express.Router();
const { getVideosByCourseID } = require("../controllers/courseVideoController");
const { validateToken } = require("../middlewares/AuthMiddleware");

/**
 * @swagger
 * /courseVideo/course-re/{courseId}:
 *   get:
 *     summary: Get all videos by course ID
 *     tags:
 *       - Videos
 *     description: Retrieve all videos associated with a specific course using the course ID.
 *     operationId: getVideosByCourseID
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to retrieve videos for.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved videos for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   videoTitle:
 *                     type: string
 *                     description: The title of the video.
 *                     example: "Introduction to JavaScript"
 *                   videoDesc:
 *                     type: string
 *                     description: A brief description of the video.
 *                     example: "This video introduces the basics of JavaScript programming."
 *                   videoURL:
 *                     type: string
 *                     description: The URL of the video.
 *                     example: "https://example.com/videos/video1.mp4"
 *                   videoDuration:
 *                     type: integer
 *                     description: The duration of the video in seconds.
 *                     example: 300
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
router.get("/course-re/:courseId", getVideosByCourseID); //For reviewe purposes

/**
 * @swagger
 * /courseVideo/course-le/{courseId}:
 *   get:
 *     summary: Get all videos for a course for learners
 *     tags:
 *       - Videos
 *     description: Retrieve all videos associated with a specific course for learners. A valid access token is required.
 *     operationId: getVideosByCourseIDForLearner
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         description: The ID of the course to retrieve videos for.
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved videos for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   videoTitle:
 *                     type: string
 *                     description: The title of the video.
 *                     example: "Introduction to JavaScript"
 *                   videoDesc:
 *                     type: string
 *                     description: A brief description of the video.
 *                     example: "This video introduces the basics of JavaScript programming."
 *                   videoURL:
 *                     type: string
 *                     description: The URL of the video.
 *                     example: "https://example.com/videos/video1.mp4"
 *                   videoDuration:
 *                     type: integer
 *                     description: The duration of the video in seconds.
 *                     example: 300
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
router.get("/course-le/:courseId", validateToken, getVideosByCourseID); //For learner purposes

module.exports = router;
