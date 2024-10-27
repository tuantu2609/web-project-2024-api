const { Users } = require('../models');
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
        res.json(users);
    }
    catch {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        if (role !== "teacher" && role !== "student") {
            return res.status(400).json({ error: "Role must be either 'teacher' or 'student'" });
          }

        const hash = await bcrypt.hash(password, 10);
        
        await Users.create({
          username: username,
          password: hash,
          role: role,
        });
        res.json("SUCCESS");
      } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
      }
}

module.exports = {
    getAllUsers,
    createUser,
};