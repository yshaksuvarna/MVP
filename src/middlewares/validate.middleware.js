const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Middleware to check for validation errors
 * Throws 400 ApiError if validation fails
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

    // Create a detailed error message
    const errorMessage = errors.array().map(err => `${err.path}: ${err.msg}`).join(", ");

    throw new ApiError(errorMessage, 400, extractedErrors);
};

module.exports = validate;
