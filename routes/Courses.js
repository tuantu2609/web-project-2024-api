// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getOneCourse,
  createCourse,
  getAllCoursesByID,
  updateCourse,
  deleteCourse,
} = require("../controllers/coursesController");
const { validateToken } = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/UploadMiddleware");

router.get("/", getAllCourses);

router.post("/", validateToken, upload.single("thumbnail"), createCourse);

router.get("/instructor", validateToken, getAllCoursesByID);

router.get("/:id", getOneCourse);

router.put("/:id", validateToken, upload.single("thumbnail"), updateCourse);

router.delete("/:id", validateToken, deleteCourse);

module.exports = router;
