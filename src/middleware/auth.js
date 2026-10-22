const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Tidak terautentikasi"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa"
    });
  }
};

module.exports = authenticate;