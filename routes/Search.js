const express = require("express");
const router = express.Router();
const { searchCourses } = require("../controllers/searchController");

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for courses
 *     tags:
 *       - Courses
 *     description: Search for courses based on a query string. The search is case-insensitive and will search through course titles.
 *     operationId: searchCourses
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: The query string used to search for courses.
 *         schema:
 *           type: string
 *           example: "JavaScript"
 *     responses:
 *       '200':
 *         description: Successfully retrieved courses matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the course.
 *                     example: 1
 *                   courseTitle:
 *                     type: string
 *                     description: The title of the course.
 *                     example: "Introduction to JavaScript"
 *                   status:
 *                     type: string
 *                     description: The status of the course (e.g., active, inactive).
 *                     example: "active"
 *                   instructorId:
 *                     type: integer
 *                     description: The ID of the instructor who is teaching the course.
 *                     example: 5
 *       '400':
 *         description: Search query is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Search query is required."
 *       '404':
 *         description: No courses found matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No courses found."
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
router.get("/", searchCourses);

module.exports = router;
