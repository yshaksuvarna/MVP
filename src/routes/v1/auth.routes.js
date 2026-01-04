const router = require("express").Router();
const authController = require("../../controllers/auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Public routes
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

// Protected routes
router.post(
    "/change-password",
    authMiddleware,
    authController.changePassword
);

module.exports = router;
