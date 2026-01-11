const { body } = require("express-validator");

exports.currentAffairValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),
    body("summary")
        .trim()
        .notEmpty()
        .withMessage("Summary is required"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),
    body("affairDate")
        .trim()
        .notEmpty()
        .withMessage("Date is required")
        .isDate()
        .withMessage("Invalid date format"),
    body("isPublished")
        .optional()
        .isBoolean()
        .withMessage("isPublished must be a boolean"),
];
