const { Accounts, UserDetails } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const { sign } = require("jsonwebtoken");

const { sendEmail } = require("../services/emailService");

// Bộ nhớ tạm thời cho mã xác thực
const verificationCodes = {};

const sendEmailVerification = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  try {
    const htmlContent = `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
    <h1 style="color: #4CAF50;">Welcome to Our App!</h1>
    <p style="font-size: 16px; color: #333;">Use the verification code below to complete your registration:</p>
    <div style="font-size: 32px; font-weight: bold; color: #4CAF50; margin: 20px 0;">
      ${code}
    </div>
    <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    <a href="http://localhost:3000/" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; margin-top: 20px;">Visit Our Website</a>
  </div>
  <p style="font-size: 12px; color: #777; margin-top: 20px;">&copy; 2024 Your Company. All rights reserved.</p>
</div>
    `;

    verificationCodes[email] = code;

    setTimeout(() => {
      delete verificationCodes[email];
    }, 10 * 60 * 1000);

    await sendEmail(
      email,
      "Your Verification Code",
      `Your verification code is: ${code}`, // Fallback text
      htmlContent
    );

    res.status(200).json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Failed to send verification email." });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  // Kiểm tra mã xác thực
  if (verificationCodes[email] && String(verificationCodes[email]) === String(code)) {
    // Nếu mã khớp, xóa mã khỏi bộ nhớ tạm
    delete verificationCodes[email];
    return res.status(200).json({ message: "Verification successful." });
  } else {
    return res.status(400).json({ error: "Invalid or expired verification code." });
  }
};

const checkDuplicate = async (req, res) => {
  const { username, email } = req.body;

  try {
    // Tìm kiếm người dùng có username hoặc email đã tồn tại
    const existingUser = await Accounts.findOne({
      where: {
        [Op.or]: [
          { username: username }, 
          { email: email }
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Username or email already exists",
      });
    }

    // Nếu không tìm thấy, trả về thông báo có thể sử dụng
    res.json({
      message: "Username and email are available",
    });
  } catch (error) {
    console.error("Error checking duplication:", error);
    res.status(500).json({
      error: "Failed to check duplication",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Accounts.findAll();
    res.json(users);
  } catch (error) {
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
    if (role !== "instructor" && role !== "student") {
      return res
        .status(400)
        .json({ error: "Role must be either 'instructor' or 'student'" });
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
  sendEmailVerification,
  verifyCode,
  checkDuplicate
};
