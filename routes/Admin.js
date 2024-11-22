const express = require("express");
const router = express.Router();
const { loginAdmin, authUser, getAllUsersWithDetails, adminUpdateUserDetails, getUserDetailsById, deleteUser, createUser} = require("../controllers/adminController");
const { validateAdminToken } = require("../middlewares/AdminMiddleware");

// Route for admin login
router.post("/login", loginAdmin);

router.get("/auth", validateAdminToken, authUser);

router.get("/users/details", validateAdminToken, getAllUsersWithDetails);

router.put("/update-user/:id", validateAdminToken, adminUpdateUserDetails);

router.get("/users/details/:id", validateAdminToken, getUserDetailsById);

router.delete("/users/:id", validateAdminToken, deleteUser);

router.post("/create-user", validateAdminToken, createUser);

module.exports = router;
