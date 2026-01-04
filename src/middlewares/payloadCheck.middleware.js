const ApiError = require("../utils/ApiError");

const payloadCheck = (req, res, next) => {
  // ✅ Skip for multipart/form-data
  if (req.is("multipart/form-data")) {
    return next();
  }

  if (
    req.method !== "GET" &&
    (!req.body || Object.keys(req.body).length === 0)
  ) {
    throw new ApiError("Request body cannot be empty!", 400);
  }

  next();
};

module.exports = payloadCheck;
