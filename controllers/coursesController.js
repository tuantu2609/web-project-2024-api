const { Courses } = require("../models");

/**
 * Get all courses for all instructors
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
 * Get all courses by instructor ID
 */
const getAllCoursesByID = async (req, res) => {
  const instructorId = req.user.id;
  try {
    const courses = await Courses.findAll({
      where: {
        instructorId: instructorId,
      },
    });

    if (courses.length === 0) {
      console.log("No courses found for instructor ID:", instructorId);
      return res.status(404).json({ message: "Course not found.", instructorId: instructorId });
    }
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ message: "Internal server error." });
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

const createCourse = async (req, res) => {
  const { courseTitle, courseDesc } = req.body;
  const instructorId = req.user.id;
  try {
    if (!courseTitle || !courseDesc) {
      return res
        .status(400)
        .json({ error: "Please provide course title and description" });
    }

    const existingCourse = await Courses.findOne({
      where: {
        courseTitle,
        instructorId,
      },
    });

    if (existingCourse) {
      return res
        .status(409)
        .json({
          error: "Course with this title already exists for this instructor",
        });
    } else {
      const newCourse = await Courses.create({
        courseTitle,
        courseDesc,
        instructorId,
      });
      return res
        .status(201)
        .json({ message: "Course created successfully", course: newCourse });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getAllCourses,
  getOneCourse,
  createCourse,
  getAllCoursesByID
};
