// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCourses } = require("../controllers/coursesColntroller");

router.get("/", getAllCourses);

module.exports = router;
