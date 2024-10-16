const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const { Videos } = require("../models");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

router.post("/", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { videoTitle, videoDesc } = req.body;

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "videosSrc",
      },
      async (error, uploadResult) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res
            .status(500)
            .json({ message: "Upload to Cloudinary failed.", error });
        }

        const videoURL = uploadResult.secure_url;
        const videoDuration = uploadResult.duration;

        const newVideo = await Videos.create({
          videoTitle,
          videoDesc,
          videoURL,
          videoDuration,
        });

        res.status(201).json({
          message: "Upload successful",
          data: newVideo,
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ message: "Server error during upload.", error: error.message });
  }
});

module.exports = router;
