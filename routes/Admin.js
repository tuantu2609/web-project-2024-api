const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminController");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

// Admin authentication
router.post("/login", loginAdmin);
router.get("/auth", validateAdminToken, authUser);

// User management
router.get("/users/details", validateAdminToken, getAllUsersWithDetails);
router.put("/update-user/:id", validateAdminToken, adminUpdateUserDetails);
router.get("/users/details/:id", validateAdminToken, getUserDetailsById);
router.delete("/users/:id", validateAdminToken, deleteUser);
router.post("/create-user", validateAdminToken, createUser);

// Course management
router.get("/courses", validateAdminToken, getAllCourses);
router.get("/courses/:id", validateAdminToken, getCourseById);
router.post("/courses", validateAdminToken, createCourse);
router.put("/courses/:id", validateAdminToken, updateCourse);
router.delete("/courses/:id", validateAdminToken, deleteCourse);
router.patch("/courses/:id/status", validateAdminToken, updateCourseStatus);
router.get("/courses/:id/details", validateAdminToken, getCourseDetailsWithVideos);

// Video management
router.delete("/videos/:id", validateAdminToken, deleteVideo);

// Approvals and Rejections
// Approvals
router.get("/pending-courses", validateAdminToken, getPendingCourses);
router.get("/pending-videos", validateAdminToken, getPendingVideos);
router.patch("/courses/:id/approve", validateAdminToken, approveCourse);
router.patch("/videos/:id/approve", validateAdminToken, approveVideo);
//Rejections
router.patch("/courses/:id/reject", validateAdminToken, rejectCourse);
router.patch("/videos/:id/reject", validateAdminToken, rejectVideo);

module.exports = router;
