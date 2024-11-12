const { Courses } = require("../models");

/**
 * Get all courses
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.findAll();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get one course by ID
 */
const getOneCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Courses.findOne({ where: { id } });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllCourses,
  getOneCourse,
};
