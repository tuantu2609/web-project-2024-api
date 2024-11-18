const { Op, Sequelize } = require("sequelize");
const { Courses } = require("../models");

const searchCourses = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Perform a case-insensitive search for MySQL
    const results = await Courses.findAll({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("courseTitle")), // Lowercase the column
        {
          [Op.like]: `%${query.toLowerCase()}%`, // Lowercase the query for comparison
        }
      ),
      attributes: ["id", "courseTitle", "status", "instructorId"], // Select relevant fields
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No courses found." });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Search API Error Details:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { searchCourses };
