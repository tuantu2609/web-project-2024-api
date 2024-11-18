const { Accounts, UserDetails } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const { sign } = require("jsonwebtoken");

const { sendEmail } = require("../services/emailService");

// Bộ nhớ tạm thời cho mã xác thực
const verificationCodes = {};

const resetCodes = {};

const sendEmailVerification = async (req, res) => {
  const { email } = req.body; // Không cần nhận `code` từ client

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Tạo mã xác minh ngẫu nhiên (5 chữ số)
    const code = Math.floor(10000 + Math.random() * 90000);

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

    // Lưu mã xác minh vào bộ nhớ tạm thời
    verificationCodes[email] = code;

    // Xóa mã sau 10 phút
    setTimeout(() => {
      delete verificationCodes[email];
    }, 10 * 60 * 1000);

    // Gửi email chứa mã xác minh
    await sendEmail(
      email,
      "Your Verification Code",
      `Your verification code is: ${code}`, // Nội dung fallback
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

// API gửi mã xác minh đặt lại mật khẩu
const sendResetCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Tạo mã xác minh ngẫu nhiên (5 chữ số)
    const code = Math.floor(10000 + Math.random() * 90000);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #4CAF50;">Password Reset Request</h1>
          <p style="font-size: 16px; color: #333;">Use the verification code below to reset your password:</p>
          <div style="font-size: 32px; font-weight: bold; color: #4CAF50; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    `;

    // Lưu mã xác minh vào bộ nhớ tạm thời
    resetCodes[email] = code;

    // Xóa mã sau 10 phút để tránh lạm dụng
    setTimeout(() => {
      delete resetCodes[email];
    }, 10 * 60 * 1000);

    // Gửi email chứa mã xác minh
    await sendEmail(
      email,
      "Password Reset Verification Code",
      `Your password reset verification code is: ${code}`, // Nội dung fallback
      htmlContent
    );

    res.status(200).json({ message: "Password reset code sent successfully." });
  } catch (error) {
    console.error("Error sending reset email:", error);
    res.status(500).json({ error: "Failed to send password reset email." });
  }
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  // Kiểm tra mã xác thực trong bộ nhớ `resetCodes`
  if (resetCodes[email] && String(resetCodes[email]) === String(code)) {
    // Nếu mã khớp, xóa mã khỏi bộ nhớ tạm
    delete resetCodes[email];
    return res.status(200).json({ message: "Verification successful." });
  } else {
    return res.status(400).json({ error: "Invalid or expired verification code." });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Tìm người dùng theo email
    const user = await Accounts.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu trong cơ sở dữ liệu
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password." });
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

const updateUserDetails = async (req, res) => {
  const { fullName, address, birthDate, phoneNumber, profilePictureURL } = req.body;
  const userId = req.user.id;

  try {
    const userDetail = await UserDetails.findOne({ where: { accountId: userId } });

    if (!userDetail) {
      return res.status(404).json({ error: "User details not found" });
    }

    await userDetail.update({ fullName, address, birthDate, phoneNumber, profilePictureURL });

    res.json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Failed to update user details" });
  }
};
// Cấu hình Multer để lưu ảnh trong thư mục "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory for uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Name the file uniquely
  },
});

// Bộ lọc để chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG, GIF, and BMP are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

const uploadProfilePicture = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Use sharp to resize and optimize the image
    const processedImagePath = `uploads/processed_${req.file.filename}`;
    await sharp(req.file.path)
      .resize(256, 256, { fit: "cover" }) // Resize to 256x256 pixels
      .toFormat("jpeg") // Convert all images to JPEG format
      .toFile(processedImagePath);

    // Save the processed image URL in the database
    const fileUrl = `${req.protocol}://${req.get("host")}/${processedImagePath}`;
    const userDetail = await UserDetails.findOne({ where: { accountId: userId } });

    if (!userDetail) {
      return res.status(404).json({ error: "User details not found" });
    }

    await userDetail.update({ profilePictureURL: fileUrl });

    res.json({ message: "Profile picture uploaded and processed successfully", url: fileUrl });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload and process profile picture" });
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
  checkDuplicate,
  sendResetCode,
  verifyResetCode,
  resetPassword,
  updateUserDetails,
  uploadProfilePicture,
};
