const { body } = require("express-validator");

exports.topperValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),
    body("achievement")
        .trim()
        .notEmpty()
        .withMessage("Achievement is required"),
];
