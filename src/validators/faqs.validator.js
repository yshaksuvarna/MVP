const { body } = require("express-validator");

exports.faqValidator = [
    body("question")
        .trim()
        .notEmpty()
        .withMessage("Question is required"),
    body("answer")
        .trim()
        .notEmpty()
        .withMessage("Answer is required"),
];
