const { body } = require("express-validator");

exports.createUserValidator = [
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("mobile")
        .trim()
        .notEmpty()
        .withMessage("Mobile number is required")
        .isMobilePhone()
        .withMessage("Invalid mobile number"),
    body("userRole")
        .optional()
        .isIn(["ADMIN", "USER", "STUDENT", "TEACHER"])
        .withMessage("Invalid user role"),
];

exports.updateUserValidator = [
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email address"),
    body("mobile")
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage("Invalid mobile number"),
    body("userRole")
        .optional()
        .isIn(["ADMIN", "USER", "STUDENT", "TEACHER"])
        .withMessage("Invalid user role"),
];
