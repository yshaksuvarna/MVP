const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User details and tokens
 */
const loginUser = async (email, password) => {
    const [rows] = await pool.execute(
        `SELECT id, userName, email, mobile, userRole, password
        FROM users WHERE email = ? LIMIT 1`,
        [email]
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

    return {
        user: {
            id: user.id,
            userName: user.userName,
            email: user.email,
            mobile: user.mobile,
            userRole: user.userRole,
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token
 * @param {string} refreshToken 
 * @returns {Promise<Object>} New access token and user details
 */
const refreshAuthToken = async (refreshTokenToken) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshTokenToken, config.jwt.refreshSecret);
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

    return {
        accessToken,
        user,
    };
};

/**
 * Change user password
 * @param {number} userId 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 * @returns {Promise<void>}
 */
const changeUserPassword = async (userId, oldPassword, newPassword) => {
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
};

module.exports = {
    loginUser,
    refreshAuthToken,
    changeUserPassword,
};
