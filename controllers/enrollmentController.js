const { Courses, Enrollments } = require("../models");

const getEnrolledCourses = async (req, res) => {
  const studentId = req.user.id; // Lấy studentId từ thông tin user đã đăng nhập

  try {
    const enrollments = await Enrollments.findAll({
      where: { studentId },
      include: [
        {
          model: Courses,
          as: "Course",
          attributes: ["id", "courseTitle", "courseDesc", "thumbnail"],
        },
      ],
    });

    // Kiểm tra nếu không có enrollment nào
    if (enrollments.length === 0) {
      return res.status(404).json({ message: "No enrolled courses found." });
    }

    // Trả về danh sách các khóa học đã đăng ký (dữ liệu từ bảng Courses)
    const enrolledCourses = enrollments.map((enrollment) => {
      return {
        courseId: enrollment.Course.id,
        courseTitle: enrollment.Course.courseTitle,
        courseDesc: enrollment.Course.courseDesc,
        thumbnail: enrollment.Course.thumbnail,
      };
    });

    res.status(200).json(enrolledCourses); // Trả về kết quả khóa học
  } catch (error) {
    console.error("Error fetching enrolled courses:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
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
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course." });
    }

    // Thêm dữ liệu vào bảng Enrollments
    const newEnrollment = await Enrollments.create({
      studentId,
      courseId,
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

module.exports = { getEnrolledCourses, enrollInCourse, checkEnrollment };
