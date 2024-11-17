const { Courses, Enrollments, Accounts, UserDetails } = require("../models");
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
    const courses = await Courses.findAll();
    res.json(courses);
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
      return res.status(404).json({ message: "Course not found.", instructorId: instructorId });
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

const createCourse = async (req, res) => {
  const { courseTitle, courseDesc } = req.body;
  const instructorId = req.user.id;
  try {
    if (!courseTitle || !courseDesc) {
      return res
        .status(400)
        .json({ error: "Please provide course title and description" });
    }

    const existingCourse = await Courses.findOne({
      where: {
        courseTitle,
        instructorId,
      },
    });

    if (existingCourse) {
      return res
        .status(409)
        .json({
          error: "Course with this title already exists for this instructor",
        });
    }

    let thumbnailURL = null;

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", //Type of file
          folder: "courseThumbnails", //Store in folder courseThumbnails
        },
        async (error, uploadResult) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).json({
              error: "Failed to upload thumbnail to Cloudinary",
            });
          }

          try {
            thumbnailURL = uploadResult.secure_url; //URL thumbnail

            //Create new course
            const newCourse = await Courses.create({
              courseTitle,
              courseDesc,
              instructorId,
              thumbnail: thumbnailURL,
            });

            return res.status(201).json({
              message: "Course created successfully",
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

      // Using streamifier to convert buffer to readable stream
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      const newCourse = await Courses.create({
        courseTitle,
        courseDesc,
        instructorId,
      });
      return res
        .status(201)
        .json({ message: "Course created successfully", course: newCourse });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

const enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  try {
    // Kiểm tra nếu đã enroll vào khóa học
    const existingEnrollment = await Enrollments.findOne({
      where: {
        studentId,
        courseId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    // Thêm dữ liệu vào bảng Enrollments
    const newEnrollment = await Enrollments.create({
      studentId,
      courseId,
      // progress: 0,
      // completed: false,
    });

    return res.status(201).json({
      message: "Successfully enrolled in the course.",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const checkEnrollment = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.id;

  try {
    const enrollment = await Enrollments.findOne({
      where: {
        studentId,
        courseId,
      },
    });

    if (enrollment) {
      return res.json({ enrolled: true });
    } else {
      return res.json({ enrolled: false });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllCourses,
  getOneCourse,
  createCourse,
  getAllCoursesByID,
  enrollInCourse,
  checkEnrollment
};
