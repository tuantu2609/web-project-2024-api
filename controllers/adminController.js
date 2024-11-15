const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Admin } = require("../models");
const JWT_ADMIN = process.env.JWT_ADMIN || "adminsercretToken";

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(404).json({ error: "Admin doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      JWT_ADMIN,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      fullName: admin.username,
      role: "admin",
      id: admin.id,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
