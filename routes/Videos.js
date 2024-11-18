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

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Returns the list of all the videos
 *     tags:
 *       - Videos
 *     responses:
 *       200:
 *         description: The list of all the videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier for the video
 *                   videoTitle:
 *                     type: string
 *                     description: The title of the video
 *                   videoDesc:
 *                     type: string
 *                     description: A brief description of the video
 *                   videoURL:
 *                     type: string
 *                     format: uri
 *                     description: The URL of the video
 *                   videoDuration:
 *                     type: number
 *                     format: float
 *                     description: The duration of the video in seconds
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time the video was uploaded
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time the video was last updated
 *       500:
 *         description: Internal server error
 */
router.get("/", validateToken, getAllVideos); //for Admin

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Upload a new video
 *     tags:
 *       - Videos
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               videoTitle:
 *                 type: string
 *                 description: The title of the video
 *               videoDesc:
 *                 type: text
 *                 description: The description of the video
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: The video file to upload
 *     responses:
 *       201:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videoTitle:
 *                   type: string
 *                 videoDesc:
 *                   type: string
 *                 videoURL:
 *                   type: string
 *                   description: The URL of the uploaded video
 *       400:
 *         description: No file uploaded.
 *       500:
 *         description: Internal server error.
 */
router.post("/", validateToken, upload.single("video"), uploadVideo);

router.put("/:videoId", validateToken, upload.single("video"), updateVideo);

router.delete("/:videoId", validateToken, deleteVideo);

module.exports = router;
