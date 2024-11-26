const { Videos, CourseVideos, Courses } = require("../models");
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
// const uploadVideo = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const { videoTitle, videoDesc, courseID } = req.body;

//     if (!videoTitle || !videoDesc) {
//       return res
//         .status(400)
//         .json({ message: "Video title and description are required." });
//     }

//     if (!courseID) {
//       return res.status(400).json({ message: "Course ID is required." });
//     }

//     const course = await Courses.findByPk(courseID);

//     if (!course) {
//       return res.status(404).json({ message: "Course not found." });
//     }

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: "video",
//         folder: "videosSrc",
//       },
//       async (error, uploadResult) => {
//         if (error) {
//           console.error("Cloudinary Upload Error:", error);
//           return res.status(500).json({
//             message: "Upload to Cloudinary failed.",
//             error: error.message,
//           });
//         }

//         try {
//           const videoURL = uploadResult.secure_url;
//           const videoDuration = uploadResult.duration;

//           const newVideo = await Videos.create({
//             videoTitle,
//             videoDesc,
//             videoURL,
//             videoDuration,
//           });

//           await CourseVideos.create({
//             courseId: courseID,
//             videoId: newVideo.id,
//           });

//           // if (course.status === "draft") {
//           //   await course.update({ status: "active" });
//           // }

//           res.status(201).json({
//             message: "Upload successful",
//             data: newVideo,
//           });
//         } catch (dbError) {
//           console.error("Database Error:", dbError);
//           res.status(500).json({
//             message: "Failed to save video data to database.",
//             error: dbError.message,
//           });
//         }
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during upload.", error: error.message });
//   }
// };

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { videoTitle, videoDesc, courseID } = req.body;

    if (!videoTitle || !videoDesc) {
      return res
        .status(400)
        .json({ message: "Video title and description are required." });
    }

    if (!courseID) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    const course = await Courses.findByPk(courseID);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "videosSrc",
      },
      async (error, uploadResult) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            message: "Upload to Cloudinary failed.",
            error: error.message,
          });
        }

        try {
          const videoURL = uploadResult.secure_url;
          const videoDuration = uploadResult.duration;

          const newVideo = await Videos.create({
            videoTitle,
            videoDesc,
            videoURL,
            videoDuration,
            status: "draft", // Default status is draft
          });

          await CourseVideos.create({
            courseId: courseID,
            videoId: newVideo.id,
          });


          // if (course.status === "draft") {
          //   await course.update({ status: "active" });
          // }


          res.status(201).json({
            message: "Upload successful. Video is awaiting approval.",
            data: newVideo,
          });
        } catch (dbError) {
          console.error("Database Error:", dbError);
          res.status(500).json({
            message: "Failed to save video data to database.",
            error: dbError.message,
          });
        }
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


const updateVideo = async (req, res) => {
  const { videoId } = req.params;
  const { videoTitle, videoDesc } = req.body;

  try {
    const video = await Videos.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    let videoURL = video.videoURL;

    // Nếu có file upload, xóa video cũ và upload video mới lên Cloudinary
    if (req.file) {
      const publicId = video.videoURL.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`videosSrc/${publicId}`, {
          resource_type: "video",
        });
        console.log(`Deleted old video: videosSrc/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting video from Cloudinary:", cloudinaryError);
        return res
          .status(500)
          .json({ message: "Failed to delete video from Cloudinary." });
      }

      // Upload video mới lên Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "videosSrc" },
        async (error, uploadResult) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return res
              .status(500)
              .json({ message: "Upload to Cloudinary failed." });
          }

          videoURL = uploadResult.secure_url;

          await video.update({ videoTitle, videoDesc, videoURL });
          return res.json({ message: "Video updated successfully.", video });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      // Cập nhật thông tin video nếu không có file mới
      await video.update({ videoTitle, videoDesc });
      res.json({ message: "Video updated successfully.", video });
    }
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Videos.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    const publicId = video.videoURL.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(`videosSrc/${publicId}`, {
        resource_type: "video",
      });
      console.log(`Deleted video: videosSrc/${publicId}`);
    } catch (cloudinaryError) {
      console.error("Error deleting video from Cloudinary:", cloudinaryError);
      return res
        .status(500)
        .json({ message: "Failed to delete video from Cloudinary." });
    }

    await CourseVideos.destroy({ where: { videoId: videoId } });

    await video.destroy();

    res.json({ message: "Video deleted successfully." });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
};
