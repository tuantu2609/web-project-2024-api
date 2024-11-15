const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { Admin } = require("../models");
const JWT_ADMIN = process.env.JWT_ADMIN || "adminSecretToken";

const loginAdmin = async (req, res) => {
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

    const token = sign(
      { id: admin.id, username: admin.username, role: "admin" },
      JWT_ADMIN
    );

    res.json({
      message: "Login successful",
      token,
      fullName: admin.username,
      id: admin.id,
      role: "admin",
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const authUser = async (req, res) => {
  res.json(req.admin);
};

module.exports = {
  loginAdmin,
  authUser
};
