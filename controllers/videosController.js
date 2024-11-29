const { Videos, CourseVideos, Courses, Notifications } = require("../models");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// /**
//  * Get all videos
//  */
// const getAllVideos = async (req, res) => {
//   try {
//     const videos = await Videos.findAll();
//     res.json(videos);
//   } catch (error) {
//     console.error("Error fetching videos:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

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

// const deleteVideo = async (req, res) => {
//   const { videoId } = req.params;
//   const { id: userId, role } = req.user; // Lấy user ID và role từ validateToken

//   try {
//     // Tìm video và kiểm tra các liên kết
//     const video = await Videos.findByPk(videoId, {
//       include: [
//         {
//           model: CourseVideos,
//           as: "CourseVideos",
//           include: [
//             {
//               model: Courses,
//               as: "Course",
//               attributes: ["instructorId"], // Chỉ lấy instructorId để kiểm tra quyền
//             },
//           ],
//         },
//       ],
//     });

//     // Nếu video không tồn tại
//     if (!video) {
//       return res.status(404).json({ message: "Video not found." });
//     }

//     // Lấy khóa học liên kết với video (nếu có)
//     const courseVideo = video.CourseVideos?.find((cv) => cv.Course);
//     const course = courseVideo?.Course;

//     // Nếu video không liên kết với khóa học
//     if (!course) {
//       return res.status(400).json({ message: "Video is not associated with any course." });
//     }

//     // Kiểm tra quyền: chỉ giảng viên của khóa học hoặc admin mới được xóa video
//     if (course.instructorId !== userId && role !== "admin") {
//       return res.status(403).json({ message: "You are not authorized to delete this video." });
//     }

//     // Xóa file video trên Cloudinary
//     const publicId = video.videoURL.split("/").pop().split(".")[0];
//     try {
//       await cloudinary.uploader.destroy(`videosSrc/${publicId}`, {
//         resource_type: "video",
//       });
//       console.log(`Deleted video: videosSrc/${publicId}`);
//     } catch (cloudinaryError) {
//       console.error("Error deleting video from Cloudinary:", cloudinaryError);
//       return res.status(500).json({ message: "Failed to delete video from Cloudinary." });
//     }

//     // Xóa bản ghi liên kết trong bảng CourseVideos
//     await CourseVideos.destroy({ where: { videoId } });

//     // Xóa bản ghi video khỏi database
//     await video.destroy();

//     res.json({ message: "Video deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting video:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

const deleteVideo = async (req, res) => {
  const { videoId } = req.params;
  const { id: userId, role } = req.user;

  try {
    const video = await Videos.findByPk(videoId, {
      include: [
        {
          model: CourseVideos,
          as: "CourseVideos",
          include: [
            {
              model: Courses,
              as: "Course",
              attributes: ["id", "courseTitle", "instructorId"],
            },
          ],
        },
      ],
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    const courseVideo = video.CourseVideos?.find((cv) => cv.Course);
    const course = courseVideo?.Course;

    if (!course) {
      return res
        .status(400)
        .json({ message: "Video is not associated with any course." });
    }

    if (course.instructorId !== userId && role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this video." });
    }

    // Delete from Cloudinary
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

    // Delete from database
    await CourseVideos.destroy({ where: { videoId } });
    await video.destroy();

    // Add notification for instructor
    await Notifications.create({
      userId: course.instructorId,
      message: `The video "${video.videoTitle}" in your course "${course.courseTitle}" has been deleted by admin.`,
      type: "videoDeletion",
    });

    // Send success response
    res.status(200).json({ message: "Video deleted successfully." });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  // getAllVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
};
