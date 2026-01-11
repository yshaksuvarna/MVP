const { body } = require("express-validator");

exports.courseValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters"),
    body("description")
        .optional()
        .trim(),
    body("duration")
        .optional()
        .trim(),
];
