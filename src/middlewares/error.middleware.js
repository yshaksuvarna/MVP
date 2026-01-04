const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode =
    err instanceof ApiError
      ? err.statusCode
      : 500;

  const message =
    err instanceof ApiError
      ? err.message
      : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
