const router = require("express").Router();
const authController = require("../../controllers/auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
    loginValidator,
    refreshTokenValidator,
    changePasswordValidator,
} = require("../../validators/auth.validator");

// Public routes
router.post("/login", loginValidator, validate, authController.login);
router.post(
    "/refresh",
    refreshTokenValidator,
    validate,
    authController.refreshToken
);

// Protected routes
router.post(
    "/change-password",
    authMiddleware,
    changePasswordValidator,
    validate,
    authController.changePassword
);

module.exports = router;
