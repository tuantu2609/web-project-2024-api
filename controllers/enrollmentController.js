const { Courses, Enrollments, Accounts, Notifications, UserDetails } = require("../models");

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

    // Lấy thông tin về khóa học và giảng viên
    const course = await Courses.findByPk(courseId, {
      include: [
        {
          model: Accounts,
          as: "Instructor",
          attributes: ["id"], // Chỉ cần lấy ID của giảng viên
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or invalid course ID." });
    }

    const instructorId = course.Instructor?.id;
    if (!instructorId) {
      return res
        .status(400)
        .json({ message: "Course does not have a valid instructor." });
    }

    // Lấy fullName của sinh viên để hiển thị trong thông báo
    const student = await Accounts.findByPk(studentId, {
      include: [
        {
          model: UserDetails,
          attributes: ["fullName"],
        },
      ],
    });

    const studentName = student?.UserDetail?.fullName || "A student";

    // Tạo thông báo cho giảng viên
    await Notifications.create({
      userId: instructorId, // ID của giảng viên
      message: `${studentName} has enrolled in your course "${course.courseTitle}".`,
      type: "studentEnrollment",
      status: "unread",
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

const getAllEnrollments = async (req, res) => {
  try {
    // Lấy tất cả bản ghi enrollments, bao gồm thông tin khóa học và người dùng
    const enrollments = await Enrollments.findAll({
      include: [
        {
          model: Courses,
          as: "Course",
          attributes: ["id", "courseTitle", "courseDesc", "thumbnail"],
        },
        {
          model: Accounts,
          as: "Student",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (enrollments.length === 0) {
      return res.status(404).json({ message: "No enrollments found." });
    }

    // Trả về danh sách các ghi danh đã lấy
    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

module.exports = {
  getEnrolledCourses,
  enrollInCourse,
  checkEnrollment,
  getAllEnrollments,
};
