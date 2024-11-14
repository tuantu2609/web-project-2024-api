const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/AdminMiddleware");

// Route for admin login
router.post("/login", adminController.login);

// Example of a protected route (dashboard)
router.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({ message: "Welcome to the admin dashboard" });
});

module.exports = router;
