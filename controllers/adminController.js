const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const {
  Admin,
  Accounts,
  UserDetails,
  Courses,
  Videos,
  CourseVideos,
  Enrollments,
} = require("../models");
const { sequelize } = require("../models");
const JWT_ADMIN = process.env.JWT_ADMIN || "adminSecretToken";

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(404).json({ error: "Admin doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = sign(
      { id: admin.id, username: admin.username, role: "admin" },
      JWT_ADMIN
    );

    res.json({
      message: "Login successful",
      token,
      fullName: admin.username,
      id: admin.id,
      role: "admin",
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const authUser = async (req, res) => {
  res.json(req.admin);
};

const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await Accounts.findAll({
      include: [
        {
          model: UserDetails,
          attributes: ["fullName", "address", "phoneNumber"], // Chỉ lấy các trường cần thiết
        },
      ],
      attributes: ["id", "username", "email", "role"], // Chỉ lấy các trường từ Accounts
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users with details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const adminUpdateUserDetails = async (req, res) => {
  const { id } = req.params; // ID của user cần cập nhật
  const { fullName, address, phoneNumber, birthDate, profilePictureURL } =
    req.body;

  try {
    // Tìm thông tin user details
    const userDetails = await UserDetails.findOne({ where: { accountId: id } });

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    // Cập nhật thông tin
    await userDetails.update({
      fullName,
      address,
      phoneNumber,
      birthDate,
      profilePictureURL,
    });

    res.status(200).json({
      message: "User details updated successfully by admin",
      userDetails,
    });
  } catch (error) {
    console.error("Error updating user details by admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserDetailsById = async (req, res) => {
  const { id } = req.params; // User ID

  try {
    const user = await Accounts.findOne({
      where: { id },
      include: [
        {
          model: UserDetails,
          attributes: ["fullName", "address", "phoneNumber", "birthDate"],
        },
        {
          model: Enrollments,
          as: "Enrollments", // Alias for enrollments
          include: [
            {
              model: Courses,
              as: "Course", // Explicitly define the alias for Courses
              attributes: ["id", "courseTitle", "courseDesc", "status"],
            },
          ],
        },
      ],
      attributes: ["id", "username", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user ID from the route parameters

  try {
    // Find the account by ID
    const account = await Accounts.findOne({ where: { id } });

    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user details first if they exist
    await UserDetails.destroy({ where: { accountId: id } });

    // Delete the account
    await Accounts.destroy({ where: { id } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const { username, fullName, email, password, role = "user" } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // Check if email or username already exists
    const existingUser = await Accounts.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const existingUsername = await Accounts.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction to ensure atomicity
    const transaction = await sequelize.transaction();

    try {
      // Create a new account
      const newAccount = await Accounts.create(
        {
          username,
          password: hashedPassword,
          email,
          role,
        },
        { transaction }
      );

      // Create the corresponding user details
      const userDetails = await UserDetails.create(
        {
          accountId: newAccount.id,
          fullName: fullName || "N/A", // Provide a default value if fullName is not provided
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      res.status(201).json({
        message: "User created successfully",
        account: {
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          role: newAccount.role,
        },
        userDetails: {
          fullName: userDetails.fullName,
        },
      });
    } catch (transactionError) {
      // Rollback transaction if any error occurs during creation
      await transaction.rollback();
      console.error("Transaction error:", transactionError);
      res.status(500).json({ error: "Failed to create user" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.findAll({
      include: [
        {
          model: Accounts,
          as: "Instructor",
          attributes: ["id", "email"],
          include: [
            {
              model: UserDetails,
              attributes: ["fullName"],
            },
          ],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Enrollments
              WHERE Enrollments.courseId = Courses.id
            )`),
            "enrollmentCount", // Alias for the count of enrollments
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM CourseVideos
              WHERE CourseVideos.courseId = Courses.id
            )`),
            "videoCount", // Alias for the count of videos
          ],
        ],
      },
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// Get a specific course by ID
const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Courses.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  const { title, description, instructor, status } = req.body;
  try {
    // Validate input
    if (!title || !description || !instructor) {
      return res
        .status(400)
        .json({ error: "Title, description, and instructor are required" });
    }

    const newCourse = await Courses.create({
      title,
      description,
      instructor,
      status: status || "pending", // Default status is "pending"
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, instructor, status } = req.body;

  try {
    const course = await Courses.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await course.update({
      title,
      description,
      instructor,
      status,
    });

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Courses.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await course.destroy();

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve or reject a course
const updateCourseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const course = await Courses.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await course.update({ status });

    res.status(200).json({
      message: `Course ${status} successfully`,
      course,
    });
  } catch (error) {
    console.error("Error updating course status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch a course's details along with its videos
const getCourseDetailsWithVideos = async (req, res) => {
  const { id } = req.params; // Course ID

  try {
    // Fetch course details along with videos and enrollments
    const course = await Courses.findOne({
      where: { id },
      include: [
        {
          model: Accounts,
          as: "Instructor",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: UserDetails,
              attributes: ["fullName", "address", "phoneNumber"],
            },
          ],
        },
        {
          model: CourseVideos,
          include: [
            {
              model: Videos,
              as: "Video", // Explicit alias defined in the association
              attributes: [
                "id",
                "videoTitle",
                "videoDesc",
                "videoURL",
                "videoDuration",
                "status",
              ],
            },
          ],
        },
        {
          model: Enrollments,
          as: "Enrollments", // Alias for enrollments
          include: [
            {
              model: Accounts,
              as: "Student",
              attributes: ["id", "username", "email"],
              include: [
                {
                  model: UserDetails,
                  attributes: ["fullName"], // Include only the full name
                },
              ],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Format the response to include course details, videos, and enrollments
    const formattedResponse = {
      id: course.id,
      title: course.courseTitle,
      description: course.courseDesc,
      thumbnail: course.thumbnail,
      status: course.status,
      instructor: course.Instructor
        ? {
            id: course.Instructor.id,
            username: course.Instructor.username,
            email: course.Instructor.email,
            fullName: course.Instructor.UserDetail?.fullName || "N/A",
          }
        : null,
      videos: course.CourseVideos.map((courseVideo) => ({
        id: courseVideo.Video.id,
        title: courseVideo.Video.videoTitle,
        description: courseVideo.Video.videoDesc,
        url: courseVideo.Video.videoURL,
        duration: courseVideo.Video.videoDuration,
        status: courseVideo.Video.status,
      })),
      enrollments: course.Enrollments.map((enrollment) => ({
        id: enrollment.id,
        studentFullName: enrollment.Student.UserDetail?.fullName || "N/A",
        enrollDate: enrollment.enrollDate,
        progress: enrollment.progress,
        completed: enrollment.completed,
      })),
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching course details with videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteVideo = async (req, res) => {
  const { id } = req.params; // Video ID

  try {
    // First, delete associations in the CourseVideos table
    await CourseVideos.destroy({
      where: { videoId: id },
    });

    // Then delete the video itself
    const video = await Videos.findOne({ where: { id } });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await video.destroy();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get pending courses
const getPendingCourses = async (req, res) => {
  try {
    const pendingCourses = await Courses.findAll({
      where: { status: "draft" },
      include: [
        {
          model: Accounts,
          as: "Instructor",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: UserDetails,
              attributes: ["fullName"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Pending courses fetched successfully",
      courses: pendingCourses,
    });
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get pending videos
const getPendingVideos = async (req, res) => {
  try {
    const pendingVideos = await Videos.findAll({
      where: { status: "draft" },
      include: [
        {
          model: Courses,
          attributes: ["id", "courseTitle"],
        },
      ],
    });

    res.status(200).json({
      message: "Pending videos fetched successfully",
      videos: pendingVideos,
    });
  } catch (error) {
    console.error("Error fetching pending videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve a course
const approveCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Courses.findOne({ where: { id } });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await course.update({ status: "active" });

    res.status(200).json({
      message: "Course approved successfully",
      course,
    });
  } catch (error) {
    console.error("Error approving course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve a video
const approveVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Videos.findOne({ where: { id } });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await video.update({ status: "active" });

    res.status(200).json({
      message: "Video approved successfully",
      video,
    });
  } catch (error) {
    console.error("Error approving video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject a course by updating its status to "rejected"
const rejectCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Courses.findOne({ where: { id } });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update the course's status to "rejected"
    await course.update({ status: "rejected" });

    res.status(200).json({ message: "Course rejected successfully", course });
  } catch (error) {
    console.error("Error rejecting course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject a video
const rejectVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Videos.findOne({ where: { id } });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await video.update({ status: "rejected" });

    res.status(200).json({
      message: "Video rejected successfully",
      video,
    });
  } catch (error) {
    console.error("Error rejecting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loginAdmin,
  authUser,
  getAllUsersWithDetails,
  adminUpdateUserDetails,
  getUserDetailsById,
  deleteUser,
  createUser,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCourseDetailsWithVideos,
  deleteVideo,
  getPendingCourses,
  getPendingVideos,
  approveCourse,
  approveVideo,
  rejectCourse,
  rejectVideo,
};
