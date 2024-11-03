const { verify } = require('jsonwebtoken');

const validateToken = (req,res,next) => {
  const accessToken = req.header("accessToken");

  if(!accessToken) return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "importantsecret");
    req.user = validToken;
    if(validToken) {
      return next();
    }
  } catch (err) {
    return res.status(403).json({ error: "Invalid Token!" });
  }
};

module.exports = { validateToken };