const { body } = require("express-validator");

exports.contactInfoValidator = [
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone is required"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required"),
    body("googleMapLink")
        .optional()
        .trim()
        .isURL()
        .withMessage("Invalid Google Map link"),
];
