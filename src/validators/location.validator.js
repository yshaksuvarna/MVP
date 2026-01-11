const { body } = require("express-validator");

exports.locationValidator = [
    body("cityName")
        .trim()
        .notEmpty()
        .withMessage("City name is required"),
    body("instituteName")
        .trim()
        .notEmpty()
        .withMessage("Institute name is required"),
    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required"),
    body("googleMapLink")
        .optional()
        .trim()
        .matches(/^https?:\/\//i)
        .withMessage("Invalid Google Map link"),
];
