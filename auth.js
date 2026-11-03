const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin login required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protectAdmin;
