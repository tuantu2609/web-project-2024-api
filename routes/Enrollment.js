const express = require("express");
const router = express.Router();
const { getEnrolledCourses, enrollInCourse, checkEnrollment, getAllEnrollments  } = require("../controllers/enrollmentController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

router.get("/enrolled", validateToken, getEnrolledCourses);

router.post("/enroll", validateToken, enrollInCourse);

router.get("/check-enrollment/:courseId", validateToken, checkEnrollment);

router.get("/", getAllEnrollments);

module.exports = router;