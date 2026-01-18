const { body } = require("express-validator");

exports.quizValidator = [
    body("headline")
        .trim()
        .notEmpty()
        .withMessage("Headline is required"),
    body("description")
        .optional()
        .trim(),
    body("questions")
        .isArray({ min: 1 })
        .withMessage("At least one question is required"),
    body("questions.*.questionText")
        .trim()
        .notEmpty()
        .withMessage("Question text is required"),
    body("questions.*.option1")
        .trim()
        .notEmpty()
        .withMessage("Option 1 is required"),
    body("questions.*.option2")
        .trim()
        .notEmpty()
        .withMessage("Option 2 is required"),
    body("questions.*.option3")
        .trim()
        .notEmpty()
        .withMessage("Option 3 is required"),
    body("questions.*.option4")
        .trim()
        .notEmpty()
        .withMessage("Option 4 is required"),
    body("questions.*.correctOption")
        .isInt({ min: 1, max: 4 })
        .withMessage("Correct option must be between 1 and 4"),
];
