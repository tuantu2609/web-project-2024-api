// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCourses, getOneCourse, createCourse, getAllCoursesByID } = require("../controllers/coursesController");
const { validateToken } = require("../middlewares/AuthMiddleware");


router.get("/", getAllCourses);

router.post("/", validateToken, createCourse);

router.get("/instructor", validateToken, getAllCoursesByID);

router.get("/:id", getOneCourse); 

module.exports = router;
