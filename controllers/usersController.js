const { Accounts } = require("../models");
const bcrypt = require("bcrypt");

const { sign } = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await Accounts.findAll();
    res.json(users);
  } catch {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createUser = async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    if (role !== "teacher" && role !== "student") {
      return res
        .status(400)
        .json({ error: "Role must be either 'teacher' or 'student'" });
    }

    const hash = await bcrypt.hash(password, 10);

    await Accounts.create({
      username: username,
      password: hash,
      email: email,
      role: role,
    });
    res.json("User created successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await Accounts.findOne({ where: { username: username } });
    if (!user) {
      return res.status(404).json({ error: "User Doesn't Exist" });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong Username And Password Combination" });
    }

    // Generate a JWT token
    const accessToken = sign(
      { username: user.username, id: user.id, role: user.role },
      process.env.JWT_SECRET
      // { expiresIn: "1h" }
    );

    // Return the token and user info
    res.json({ token: accessToken, username: user.username, id: user.id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const authUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  authUser,
};
