const express = require("express");
const router = express.Router();
const { searchCourses } = require("../controllers/searchController");

// Define the route for searching courses
router.get("/", searchCourses);

module.exports = router;
