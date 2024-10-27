const { Videos } = require("../models");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get all videos
 */
const getAllVideos = async (req, res) => {
  try {
    const videos = await Videos.findAll();
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Upload new video
 */
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { videoTitle, videoDesc } = req.body;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "videosSrc",
      },
      async (error, uploadResult) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res
            .status(500)
            .json({ message: "Upload to Cloudinary failed.", error: error.message });
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

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ message: "Server error during upload.", error: error.message });
  }
};

module.exports = {
  getAllVideos,
  uploadVideo,
};