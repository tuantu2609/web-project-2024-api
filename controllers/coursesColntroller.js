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

module.exports = {
  getAllCourses,
};
