const express = require("express");
const router = express.Router();
const { loginAdmin, authUser } = require("../controllers/adminController");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

// Route for admin login
router.post("/login", loginAdmin);

router.get("/auth", validateAdminToken, authUser);
module.exports = router;
