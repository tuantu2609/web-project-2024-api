const express = require("express");
const router = express.Router();
const { getVideosByCourseID } = require("../controllers/courseVideoController");
const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/course-re/:courseId", getVideosByCourseID); //For reviewe purposes

router.get("/course-le/:courseId", validateToken, getVideosByCourseID); //For learner purposes

module.exports = router;
