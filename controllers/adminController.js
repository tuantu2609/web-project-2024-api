const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { Admin, Accounts, UserDetails } = require("../models");
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

const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await Accounts.findAll({
      include: [
        {
          model: UserDetails,
          attributes: ["fullName", "address", "phoneNumber"], // Chỉ lấy các trường cần thiết
        },
      ],
      attributes: ["id", "username", "email", "role"], // Chỉ lấy các trường từ Accounts
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users with details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const adminUpdateUserDetails = async (req, res) => {
  const { id } = req.params; // ID của user cần cập nhật
  const { fullName, address, phoneNumber, birthDate, profilePictureURL } =
    req.body;

  try {
    // Tìm thông tin user details
    const userDetails = await UserDetails.findOne({ where: { accountId: id } });

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    // Cập nhật thông tin
    await userDetails.update({
      fullName,
      address,
      phoneNumber,
      birthDate,
      profilePictureURL,
    });

    res.status(200).json({
      message: "User details updated successfully by admin",
      userDetails,
    });
  } catch (error) {
    console.error("Error updating user details by admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserDetailsById = async (req, res) => {
  const { id } = req.params; // Lấy user ID từ URL
  try {
    const user = await Accounts.findOne({
      where: { id },
      include: [
        {
          model: UserDetails,
          attributes: ["fullName", "address", "phoneNumber", "birthDate"], // Các thông tin cần lấy
        },
      ],
      attributes: ["id", "username", "email", "role"], // Thông tin từ bảng Accounts
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user ID from the route parameters

  try {
    // Find the account by ID
    const account = await Accounts.findOne({ where: { id } });

    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user details first if they exist
    await UserDetails.destroy({ where: { accountId: id } });

    // Delete the account
    await Accounts.destroy({ where: { id } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const { username, fullName, email, password, role = "user" } = req.body;

  try {
    // Check if email or username already exists
    const existingUser = await Accounts.findOne({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new account
    const newAccount = await Accounts.create({
      username,
      password: hashedPassword,
      email,
      role,
    });

    // Create the corresponding user details
    await UserDetails.create({
      accountId: newAccount.id,
      fullName,
    });

    res.status(201).json({
      message: "User created successfully",
      account: {
        id: newAccount.id,
        username: newAccount.username,
        email: newAccount.email,
        role: newAccount.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loginAdmin,
  authUser,
  getAllUsersWithDetails,
  adminUpdateUserDetails,
  getUserDetailsById,
  deleteUser,
  createUser
};
