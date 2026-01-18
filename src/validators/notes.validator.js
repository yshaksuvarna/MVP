const { body } = require("express-validator");

exports.noteValidator = [
    body("headline")
        .trim()
        .notEmpty()
        .withMessage("Headline is required"),
    body("description")
        .optional()
        .trim()
];
