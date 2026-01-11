const authService = require("../services/auth.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

/* ================= LOGIN ================= */

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    return res.status(200).json({
        success: true,
        message: "Login Successful",
        userDetails: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
});

/* ================= REFRESH TOKEN ================= */

exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAuthToken(refreshToken);

    return successResponse(res, result);
});

/* ================= CHANGE PASSWORD ================= */

exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // 🔐 from auth.middleware

    await authService.changeUserPassword(userId, oldPassword, newPassword);

    return successResponse(res, null, "Password updated successfully");
});
