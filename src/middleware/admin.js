const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses hanya untuk admin"
    });
  }

  next();
};

module.exports = admin;