const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
};

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error caught:", err);
  console.log("Error Type:", err.constructor.name);
  console.log("Error Keys:", Object.keys(err));
  console.log("Error StatusCode:", err.statusCode);
  console.log("Error Message:", err.message);

  const statusCode =
    err instanceof ApiError || err.statusCode
      ? err.statusCode
      : 500;

  const message =
    err instanceof ApiError || err.statusCode
      ? err.message
      : "Internal Server Error";

  res.status(statusCode || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
