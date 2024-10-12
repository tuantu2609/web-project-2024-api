const express = require("express");
const router = express.Router();
const { Videos } = require("../models");

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
 *                   title:
 *                     type: string
 *                     description: The title of the video
 *                   description:
 *                     type: string
 *                     description: A brief description of the video
 *                   url:
 *                     type: string
 *                     format: uri
 *                     description: The URL of the video
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
    const videos = await Videos.findAll();
    res.json(videos);
});

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Creates a new video entry
 *     tags:
 *       - Videos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoTitle:
 *                 type: string
 *                 description: The title of the video
 *                 example: "Introduction - Full Stack Web Development Course [1] - ReactJS, NodeJS, Express, MySQL"
 *               videoDesc:
 *                 type: string
 *                 description: A brief description of the video
 *                 example: "Hey everyone, this is the first episode of this series where I will show how to create a full stack web app!"
 *               videoURL:
 *                 type: string
 *                 format: uri
 *                 description: The URL of the video
 *                 example: "https://example.com/video.mp4"
 *     responses:
 *       201:
 *         description: The newly created video entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier for the video
 *                 videoTitle:
 *                   type: string
 *                   description: The title of the video
 *                 videoDesc:
 *                   type: string
 *                   description: A brief description of the video
 *                 videoURL:
 *                   type: string
 *                   format: uri
 *                   description: The URL of the video
 *       400:
 *         description: Bad Request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
    const { videoTitle, videoDesc, videoURL } = req.body;
    const newVideo = await Videos.create({ videoTitle, videoDesc, videoURL });
    res.json(newVideo);
});

module.exports = router;