const express = require("express");
const router = express.Router();
const { getEnrolledCourses, enrollInCourse, checkEnrollment  } = require("../controllers/enrollmentController");
const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/enrolled", validateToken, getEnrolledCourses);

router.post("/enroll", validateToken, enrollInCourse);

router.get("/check-enrollment/:courseId", validateToken, checkEnrollment);

module.exports = router;