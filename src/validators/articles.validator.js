const { body } = require("express-validator");

exports.articleValidator = [
    body("headline")
        .trim()
        .notEmpty()
        .withMessage("Headline is required"),
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Content is required"),
    body("subheadlines")
        .optional()
        .isArray()
        .withMessage("Subheadlines must be an array"),
    body("subheadlines.*")
        .trim()
        .notEmpty()
        .withMessage("Subheadline text cannot be empty"),
];
