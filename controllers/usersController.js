const { Accounts, UserDetails } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

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
  const {
    username,
    password,
    email,
    role,
    firstName,
    lastName,
    phone,
    birthDate,
  } = req.body;
  try {
    if (role !== "teacher" && role !== "student") {
      return res
        .status(400)
        .json({ error: "Role must be either 'teacher' or 'student'" });
    }

    const existingUser = await Accounts.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newAccount = await Accounts.create({
      username: username,
      password: hash,
      email: email,
      role: role,
    });
    await UserDetails.create({
      accountId: newAccount.id,
      fullName: `${firstName} ${lastName}`,
      phoneNumber: phone,
      birthDate: birthDate,
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
    const user = await Accounts.findOne({
      where: { username: username },
      include: {
        model: UserDetails,
        attributes: ["fullName"],
      },
    });
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
      { fullName: user.UserDetail.fullName, id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    // Return the token and user info
    res.json({
      token: accessToken,
      fullName: user.UserDetail.fullName, // Lấy fullName từ UserDetails
      role: user.role,
      id: user.id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const authUser = async (req, res) => {
  res.json(req.user);
};

const getUserDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token đã giải mã trong req.user

    // Tìm thông tin chi tiết của người dùng từ bảng UserDetails
    const userDetail = await UserDetails.findOne({
      where: { accountId: userId },
      attributes: [
        // "fullName",
        "address",
        "phoneNumber",
        "birthDate",
        "profilePictureURL",
        "createdAt",
      ],
    });

    // Nếu không tìm thấy thông tin chi tiết
    if (!userDetail) {
      return res.status(404).json({ error: "User details not found" });
    }

    // Trả về thông tin người dùng chi tiết cùng với thông tin tài khoản từ token
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      userDetails: userDetail,
    });
  } catch (error) {
    console.error("Error in getUserDetail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  authUser,
  getUserDetail,
};
