const {
  Courses,
  Enrollments,
  CourseVideos,
  Accounts,
  UserDetails,
  Videos,
} = require("../models");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get all courses for all instructors
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.findAll({
      include: [
        {
          model: Enrollments,
          attributes: ["id"], // Đếm số lượng enrollments
        },
        {
          model: CourseVideos,
          attributes: ["id"], // Đếm số lượng video
        },
      ],
    });

    const courseData = courses.map((course) => {
      return {
        id: course.id,
        courseTitle: course.courseTitle,
        courseDesc: course.courseDesc,
        thumbnail: course.thumbnail,
        status: course.status,
        participants: course.Enrollments.length,
        lessons: course.CourseVideos.length,
      };
    });

    res.json(courseData);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get all courses by instructor ID
 */
const getAllCoursesByID = async (req, res) => {
  const instructorId = req.user.id;
  try {
    const courses = await Courses.findAll({
      where: {
        instructorId: instructorId,
      },
    });

    if (courses.length === 0) {
      console.log("No courses found for instructor ID:", instructorId);
      return res
        .status(404)
        .json({ message: "Course not found.", instructorId: instructorId });
    }
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get one course by ID
 */
const getOneCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Courses.findOne({
      where: { id },
      include: [
        {
          model: Accounts, // Bảng Accounts
          as: "Instructor",
          attributes: ["id"],
          include: [
            {
              model: UserDetails, // Bảng UserDetails
              attributes: ["fullName"], // Chỉ lấy fullName
            },
          ],
        },
      ],
    });

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// const createCourse = async (req, res) => {
//   const { courseTitle, courseDesc } = req.body;
//   const instructorId = req.user.id;
//   try {
//     if (!courseTitle || !courseDesc) {
//       return res
//         .status(400)
//         .json({ error: "Please provide course title and description" });
//     }

//     const existingCourse = await Courses.findOne({
//       where: {
//         courseTitle,
//         instructorId,
//       },
//     });

//     if (existingCourse) {
//       return res.status(409).json({
//         error: "Course with this title already exists for this instructor",
//       });
//     }

//     let thumbnailURL = null;

//     if (req.file) {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: "image", //Type of file
//           folder: "courseThumbnails", //Store in folder courseThumbnails
//         },
//         async (error, uploadResult) => {
//           if (error) {
//             console.error("Cloudinary Upload Error:", error);
//             return res.status(500).json({
//               error: "Failed to upload thumbnail to Cloudinary",
//             });
//           }

//           try {
//             thumbnailURL = uploadResult.secure_url; //URL thumbnail

//             //Create new course
//             const newCourse = await Courses.create({
//               courseTitle,
//               courseDesc,
//               instructorId,
//               thumbnail: thumbnailURL,
//             });

//             return res.status(201).json({
//               message: "Course created successfully",
//               course: newCourse,
//             });
//           } catch (dbError) {
//             console.error("Database Error:", dbError);
//             return res.status(500).json({
//               error: "Failed to save course to database.",
//             });
//           }
//         }
//       );

//       // Using streamifier to convert buffer to readable stream
//       streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//     } else {
//       const newCourse = await Courses.create({
//         courseTitle,
//         courseDesc,
//         instructorId,
//       });
//       return res
//         .status(201)
//         .json({ message: "Course created successfully", course: newCourse });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

const createCourse = async (req, res) => {
  const { courseTitle, courseDesc } = req.body;
  const instructorId = req.user.id;
  try {
    if (!courseTitle || !courseDesc) {
      return res.status(400).json({ error: "Please provide course title and description" });
    }

    const existingCourse = await Courses.findOne({
      where: {
        courseTitle,
        instructorId,
      },
    });

    if (existingCourse) {
      return res.status(409).json({
        error: "Course with this title already exists for this instructor",
      });
    }

    let thumbnailURL = null;

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "courseThumbnails",
        },
        async (error, uploadResult) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).json({
              error: "Failed to upload thumbnail to Cloudinary",
            });
          }

          try {
            thumbnailURL = uploadResult.secure_url;

            const newCourse = await Courses.create({
              courseTitle,
              courseDesc,
              instructorId,
              thumbnail: thumbnailURL,
              status: "draft", // Default status is draft
            });

            return res.status(201).json({
              message: "Course created successfully. Awaiting approval.",
              course: newCourse,
            });
          } catch (dbError) {
            console.error("Database Error:", dbError);
            return res.status(500).json({
              error: "Failed to save course to database.",
            });
          }
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      const newCourse = await Courses.create({
        courseTitle,
        courseDesc,
        instructorId,
        status: "draft", // Default status is draft
      });
      return res
        .status(201)
        .json({ message: "Course created successfully. Awaiting approval.", course: newCourse });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};


const updateCourse = async (req, res) => {
  const { id } = req.params; // ID of the course
  const { courseTitle, courseDesc } = req.body; // Title and description from body
  const { id: userId, role } = req.user; // Extract user ID and role from validateToken middleware

  try {
    // Find the course by ID
    const course = await Courses.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Check if the user is the course owner or an admin
    if (course.instructorId !== userId && role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this course." });
    }

    let thumbnailURL = course.thumbnail;

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // Image file
          folder: "courseThumbnails", // Folder name in Cloudinary
        },
        async (error, uploadResult) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).json({
              message: "Failed to upload thumbnail to Cloudinary.",
            });
          }

          try {
            thumbnailURL = uploadResult.secure_url;

            await course.update({
              courseTitle,
              courseDesc,
              thumbnail: thumbnailURL,
            });

            res.json({
              message: "Course updated successfully.",
              course,
            });
          } catch (dbError) {
            console.error("Database Error:", dbError);
            res.status(500).json({ message: "Failed to update course." });
          }
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      await course.update({ courseTitle, courseDesc, thumbnail: thumbnailURL });
      res.json({
        message: "Course updated successfully.",
        course,
      });
    }
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params; // ID của khóa học
  const { id: userId, role } = req.user; // Lấy user ID và role từ validateToken

  try {
    const course = await Courses.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Kiểm tra nếu người dùng là chủ sở hữu hoặc là admin
    if (course.instructorId !== userId && role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this course." });
    }

    // Nếu khóa học có thumbnail, xóa ảnh trên Cloudinary
    if (course.thumbnail) {
      const publicId = course.thumbnail.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`courseThumbnails/${publicId}`);
        console.log(`Deleted image: courseThumbnails/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        return res.status(500).json({
          message: "Failed to delete image from Cloudinary.",
        });
      }
    }

    // Lấy danh sách video liên kết với khóa học
    const courseVideos = await CourseVideos.findAll({ where: { courseId: id } });

    for (const courseVideo of courseVideos) {
      const video = await Videos.findByPk(courseVideo.videoId);

      if (video && video.videoURL) {
        const publicId = video.videoURL.split('/').pop().split('.')[0];

        // Xóa video trên Cloudinary
        try {
          await cloudinary.uploader.destroy(`videosSrc/${publicId}`, { resource_type: "video" });
          console.log(`Deleted video: videosSrc/${publicId}`);
        } catch (cloudinaryError) {
          console.error("Error deleting video from Cloudinary:", cloudinaryError);
          return res.status(500).json({
            message: "Failed to delete video from Cloudinary.",
          });
        }
      }

      // Xóa bản ghi trong CourseVideos trước
      await CourseVideos.destroy({ where: { videoId: courseVideo.videoId } });

      // Xóa bản ghi video trong cơ sở dữ liệu
      await video.destroy();
    }

    // Sau khi xóa video, xóa khóa học khỏi cơ sở dữ liệu
    await course.destroy();

    res.json({ message: "Course, associated videos, and image deleted successfully." });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = {
  getAllCourses,
  getOneCourse,
  createCourse,
  getAllCoursesByID,
  updateCourse,
  deleteCourse,
};
