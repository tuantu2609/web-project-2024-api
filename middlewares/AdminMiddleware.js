const { verify } = require("jsonwebtoken");
const JWT_ADMIN = process.env.JWT_ADMIN;

const validateAdminToken = (req, res, next) => {
  const token = req.header("accessToken");

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const validToken = verify(token, JWT_ADMIN);
    req.user = validToken;
    if (validToken) {
      return next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { validateAdminToken };
