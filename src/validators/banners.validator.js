const { body } = require("express-validator");

exports.bannerValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Banner title is required"),
    body("subTitle")
        .optional()
        .trim(),
];
