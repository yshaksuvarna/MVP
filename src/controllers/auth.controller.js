const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

/* ================= LOGIN ================= */

exports.login = asyncHandler(async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        throw new ApiError("Username and password are required", 400);
    }

    const [rows] = await pool.execute(
        `SELECT id, userName, email, mobile, userRole, password
        FROM users WHERE userName = ? LIMIT 1`,
        [userName]
    );

    if (!rows.length) {
        throw new ApiError("Invalid credentials", 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401);
    }

    const payload = {
        id: user.id,
        userName: user.userName,
        role: user.userRole,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    });

    return res.status(200).json({
        success: true,
        message: "Login Successful",
        userDetails: {
            id: user.id,
            userName: user.userName,
            email: user.email,
            mobile: user.mobile,
            userRole: user.userRole,
        },
        accessToken,
        refreshToken,
    });
});

/* ================= REFRESH TOKEN ================= */

exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError("Refresh token is required", 400);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
        throw new ApiError("Invalid or expired refresh token", 401);
    }

    const [rows] = await pool.execute(
        `SELECT id, userName, email, mobile, userRole
        FROM users WHERE id = ? LIMIT 1`,
        [decoded.id]
    );

    if (!rows.length) {
        throw new ApiError("User not found", 404);
    }

    const user = rows[0];

    const accessToken = jwt.sign(
        {
            id: user.id,
            userName: user.userName,
            role: user.userRole,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );

    return successResponse(res, {
        accessToken,
        user,
    });
});

/* ================= CHANGE PASSWORD ================= */

exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // 🔐 from auth.middleware

    if (!oldPassword || !newPassword) {
        throw new ApiError("Old and new passwords are required", 400);
    }

    const [rows] = await pool.execute(
        `SELECT password FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );

    if (!rows.length) {
        throw new ApiError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);

    if (!isMatch) {
        throw new ApiError("Old password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, userId]
    );

    return successResponse(res, null, "Password updated successfully");
});
