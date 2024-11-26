const express = require("express");
const router = express.Router();
const upload = require("../middlewares/UploadMiddleware");
const {
  getAllVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/videosController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags:
 *       - Videos
 *     description: Retrieve all videos in the system. This endpoint is for Admin purposes only. A valid access token is required.
 *     operationId: getAllVideos
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique ID of the video.
 *                     example: 1
 *                   videoTitle:
 *                     type: string
 *                     description: The title of the video.
 *                     example: "Introduction to Machine Learning"
 *                   videoURL:
 *                     type: string
 *                     description: The URL of the video.
 *                     example: "https://example.com/videos/video1.mp4"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the video was uploaded.
 *                     example: "2024-01-01T12:00:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the video was last updated.
 *                     example: "2024-01-02T12:00:00Z"
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
router.get("/", validateAdminToken, getAllVideos); //for Admin

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Upload a new video
 *     tags:
 *       - Videos
 *     description: Upload a new video to a specific course. A valid access token is required.
 *     operationId: uploadVideo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               videoTitle:
 *                 type: string
 *                 description: The title of the video.
 *                 example: "Introduction to Machine Learning"
 *               videoDesc:
 *                 type: string
 *                 description: A short description of the video.
 *                 example: "Learn the basics of machine learning in this video."
 *               courseID:
 *                 type: integer
 *                 description: The ID of the course the video belongs to.
 *                 example: 1
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: The video file to upload.
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '201':
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Upload successful"
 *                 data:
 *                   type: object
 *                   description: The newly uploaded video details.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the video.
 *                       example: 1
 *                     videoTitle:
 *                       type: string
 *                       description: The title of the video.
 *                       example: "Introduction to Machine Learning"
 *                     videoDesc:
 *                       type: string
 *                       description: The description of the video.
 *                       example: "Learn the basics of machine learning in this video."
 *                     videoURL:
 *                       type: string
 *                       description: The URL of the uploaded video.
 *                       example: "https://example.com/videos/video1.mp4"
 *                     videoDuration:
 *                       type: number
 *                       description: The duration of the video in seconds.
 *                       example: 120
 *       '400':
 *         description: Bad request due to missing required fields or no file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video title and description are required."
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
 *         description: Internal server error during upload or saving data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error during upload."
 */
router.post("/", validateToken, upload.single("video"), uploadVideo);

/**
 * @swagger
 * /videos/{videoId}:
 *   put:
 *     summary: Update a video
 *     tags:
 *       - Videos
 *     description: Update the details of an existing video, including replacing the video file. A valid access token is required.
 *     operationId: updateVideo
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         description: The ID of the video to update.
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
 *               videoTitle:
 *                 type: string
 *                 description: The updated title of the video.
 *                 example: "Advanced Machine Learning Concepts"
 *               videoDesc:
 *                 type: string
 *                 description: The updated description of the video.
 *                 example: "This video explains advanced concepts in machine learning."
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Optional new video file to replace the current one.
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video updated successfully."
 *                 video:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the video.
 *                       example: 1
 *                     videoTitle:
 *                       type: string
 *                       description: The title of the video.
 *                       example: "Advanced Machine Learning Concepts"
 *                     videoDesc:
 *                       type: string
 *                       description: The description of the video.
 *                       example: "This video explains advanced concepts in machine learning."
 *                     videoURL:
 *                       type: string
 *                       description: The URL of the updated video.
 *                       example: "https://example.com/videos/new-video.mp4"
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found."
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
router.put("/:videoId", validateToken, upload.single("video"), updateVideo);

/**
 * @swagger
 * /videos/{videoId}:
 *   delete:
 *     summary: Delete a video
 *     tags:
 *       - Videos
 *     description: Delete a video from the system, including its record in the database and the associated file on Cloudinary. A valid access token is required.
 *     operationId: deleteVideo
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         description: The ID of the video to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - accessTokenAuth: []
 *     responses:
 *       '200':
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video deleted successfully."
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found."
 *       '500':
 *         description: Internal server error during video deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.delete("/:videoId", validateToken, deleteVideo);

module.exports = router;
