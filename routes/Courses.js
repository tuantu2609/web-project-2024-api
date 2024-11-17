// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCourses, getOneCourse, createCourse, getAllCoursesByID, enrollInCourse, checkEnrollment } = require("../controllers/coursesController");
const { validateToken } = require("../middlewares/AuthMiddleware");


router.get("/", getAllCourses);

router.post("/", validateToken, createCourse);

router.get("/instructor", validateToken, getAllCoursesByID);

router.get("/:id", getOneCourse); 

router.post("/enroll", validateToken, enrollInCourse);

router.get("/check-enrollment/:courseId", validateToken, checkEnrollment);

module.exports = router;
