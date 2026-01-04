const ApiError = require("./ApiError");

/**
 * Success response helper
 */
const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response helper (optional usage)
 * Mostly useful in edge cases (non-Express flows)
 */
const errorResponse = (res, err) => {
  if (!(err instanceof ApiError)) {
    err = new ApiError("Internal Server Error", 500);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || undefined,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
