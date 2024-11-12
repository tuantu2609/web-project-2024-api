// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCourses, getOneCourse } = require("../controllers/coursesController"); 

router.get("/", getAllCourses);
router.get("/:id", getOneCourse); 

module.exports = router;
