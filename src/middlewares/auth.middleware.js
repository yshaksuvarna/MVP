const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError("Authentication token missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user identity to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    throw new ApiError("Invalid or expired token", 401);
  }
};

module.exports = authMiddleware;
