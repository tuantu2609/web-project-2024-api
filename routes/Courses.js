// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getOneCourse,
  createCourse,
  getAllCoursesByID,
  updateCourse,
  deleteCourse,
} = require("../controllers/coursesController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/UploadMiddleware");

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags:
 *       - Courses
 *     description: Retrieve all courses along with the number of participants and lessons for each course.
 *     operationId: getAllCourses
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the course
 *                     example: 1
 *                   courseTitle:
 *                     type: string
 *                     description: The title of the course
 *                     example: "Introduction to JavaScript"
 *                   courseDesc:
 *                     type: string
 *                     description: A short description of the course
 *                     example: "Learn the basics of JavaScript programming."
 *                   thumbnail:
 *                     type: string
 *                     description: URL of the course thumbnail image
 *                     example: "https://example.com/thumbnail.jpg"
 *                   status:
 *                     type: string
 *                     description: The status of the course (e.g., "published", "draft")
 *                     example: "published"
 *                   participants:
 *                     type: integer
 *                     description: The number of participants enrolled in the course
 *                     example: 25
 *                   lessons:
 *                     type: integer
 *                     description: The number of lessons/videos in the course
 *                     example: 10
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
router.get("/", getAllCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Courses
 *     description: This endpoint allows an instructor to create a new course with a title, description, and an optional thumbnail image. A valid access token is required.
 *     operationId: createCourse
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseTitle:
 *                 type: string
 *                 description: The title of the course.
 *                 example: "Introduction to Machine Learning"
 *               courseDesc:
 *                 type: string
 *                 description: A short description of the course.
 *                 example: "This course covers the fundamentals of machine learning."
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional thumbnail image for the course.
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '201':
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course created successfully"
 *                 course:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created course.
 *                       example: 1
 *                     courseTitle:
 *                       type: string
 *                       description: The title of the course.
 *                       example: "Introduction to Machine Learning"
 *                     courseDesc:
 *                       type: string
 *                       description: A short description of the course.
 *                       example: "This course covers the fundamentals of machine learning."
 *                     instructorId:
 *                       type: integer
 *                       description: The ID of the instructor creating the course.
 *                       example: 1
 *                     thumbnail:
 *                       type: string
 *                       description: URL of the uploaded thumbnail.
 *                       example: "https://example.com/thumbnails/course-image.jpg"
 *       '400':
 *         description: Bad request due to missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Please provide course title and description"
 *       '409':
 *         description: Conflict due to duplicate course title for the same instructor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Course with this title already exists for this instructor"
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
router.post("/", validateToken, upload.single("thumbnail"), createCourse);

/**
 * @swagger
 * /courses/instructor:
 *   get:
 *     summary: Get all courses by instructor ID
 *     tags:
 *       - Courses
 *     description: Retrieve all courses created by the instructor based on their ID. A valid access token is required.
 *     operationId: getAllCoursesByID
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of courses created by the instructor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the course
 *                     example: 1
 *                   courseTitle:
 *                     type: string
 *                     description: The title of the course
 *                     example: "Introduction to Data Science"
 *                   courseDesc:
 *                     type: string
 *                     description: A short description of the course
 *                     example: "Learn the fundamentals of data science."
 *                   thumbnail:
 *                     type: string
 *                     description: URL of the course thumbnail image
 *                     example: "https://example.com/thumbnail.jpg"
 *                   status:
 *                     type: string
 *                     description: The status of the course (e.g., "published", "draft")
 *                     example: "published"
 *                   instructorId:
 *                     type: integer
 *                     description: The ID of the instructor who created the course
 *                     example: 1
 *       '404':
 *         description: No courses found for the instructor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
 *                 instructorId:
 *                   type: integer
 *                   description: The ID of the instructor
 *                   example: 1
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
router.get("/instructor", validateToken, getAllCoursesByID);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get one course by ID
 *     tags:
 *       - Courses
 *     description: Retrieve details of a specific course by its ID, including instructor information and full name.
 *     operationId: getOneCourse
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the course to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the course
 *                   example: 1
 *                 courseTitle:
 *                   type: string
 *                   description: The title of the course
 *                   example: "Introduction to Data Science"
 *                 courseDesc:
 *                   type: string
 *                   description: A short description of the course
 *                   example: "Learn the fundamentals of data science."
 *                 thumbnail:
 *                   type: string
 *                   description: URL of the course thumbnail image
 *                   example: "https://example.com/thumbnail.jpg"
 *                 status:
 *                   type: string
 *                   description: The status of the course (e.g., "published", "draft")
 *                   example: "published"
 *                 instructor:
 *                   type: object
 *                   description: Information about the instructor of the course
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the instructor
 *                       example: 1
 *                     fullName:
 *                       type: string
 *                       description: The full name of the instructor
 *                       example: "John Doe"
 *       '404':
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
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
router.get("/:id", getOneCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags:
 *       - Courses
 *     description: Update the details of a specific course, including its title, description, and optional thumbnail image. Only the course owner or an admin can update the course. A valid access token is required.
 *     operationId: updateCourse
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the course to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseTitle:
 *                 type: string
 *                 description: The updated title of the course.
 *                 example: "Advanced Machine Learning"
 *               courseDesc:
 *                 type: string
 *                 description: The updated description of the course.
 *                 example: "A deep dive into advanced machine learning concepts."
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Optional updated thumbnail image for the course.
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course updated successfully."
 *                 course:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the course.
 *                       example: 1
 *                     courseTitle:
 *                       type: string
 *                       description: The title of the course.
 *                       example: "Advanced Machine Learning"
 *                     courseDesc:
 *                       type: string
 *                       description: The description of the course.
 *                       example: "A deep dive into advanced machine learning concepts."
 *                     thumbnail:
 *                       type: string
 *                       description: URL of the updated thumbnail image.
 *                       example: "https://example.com/thumbnails/new-image.jpg"
 *       '403':
 *         description: User not authorized to update the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update this course."
 *       '404':
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
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
router.put("/:id", validateToken, upload.single("thumbnail"), updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags:
 *       - Courses
 *     description: Delete a specific course, including its associated thumbnail and videos. Only the course owner or an admin can delete the course. A valid access token is required.
 *     operationId: deleteCourse
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the course to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Course and associated resources deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course, associated videos, and image deleted successfully."
 *       '403':
 *         description: User not authorized to delete the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to delete this course."
 *       '404':
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
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
router.delete("/:id", validateToken, deleteCourse);

module.exports = router;
