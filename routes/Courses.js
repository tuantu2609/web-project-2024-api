// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCourses, getOneCourse, createCourse, getAllCoursesByID, enrollInCourse, checkEnrollment, searchCourses } = require("../controllers/coursesController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/UploadMiddleware");

router.get("/", getAllCourses);

router.post("/", validateToken, upload.single("thumbnail"), createCourse);

router.get("/instructor", validateToken, getAllCoursesByID);

router.get("/:id", getOneCourse); 

router.post("/enroll", validateToken, enrollInCourse);

router.get("/check-enrollment/:courseId", validateToken, checkEnrollment);

router.get("/search", searchCourses);

module.exports = router;
