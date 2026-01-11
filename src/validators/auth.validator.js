const { body } = require("express-validator");

const loginValidator = [
    body("email").notEmpty(),
    body("password").notEmpty(),
];

const refreshTokenValidator = [
    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required"),
];

const changePasswordValidator = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error("New password cannot be the same as old password");
            }
            return true;
        }),
];

module.exports = {
    loginValidator,
    refreshTokenValidator,
    changePasswordValidator,
};
