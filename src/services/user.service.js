const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

/**
 * Create a new user
 * @param {Object} userData
 * @returns {Object} Created user data
 */
exports.createUser = async (userData) => {
    const { userName, email, password, mobile, userRole } = userData;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [exists] = await conn.execute(
            "SELECT id FROM users WHERE userName = ? OR email = ?",
            [userName, email]
        );

        if (exists.length) {
            throw new ApiError("User already exists", 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await conn.execute(
            `
            INSERT INTO users (
                userName, email, password, mobile, userRole, inActive
            ) VALUES (?, ?, ?, ?, ?, 0)
            `,
            [userName, email, hashedPassword, mobile, userRole || "USER"]
        );

        await conn.commit();
        return { id: result.insertId };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

/**
 * Get user by ID
 * @param {string} id
 * @returns {Object} User data
 */
exports.getUserById = async (id) => {
    const [[user]] = await pool.execute(
        `
        SELECT id, userName, email, mobile, userRole, createdAt
        FROM users
        WHERE id = ? AND inActive = 0
        `,
        [id]
    );

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    return user;
};

/**
 * Get list of users with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Object} List of users and pagination meta
 */
exports.getUsersList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const [[{ total }]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM users WHERE inActive = 0"
    );

    const [rows] = await pool.execute(
        `
        SELECT id, userName, email, mobile, userRole, createdAt
        FROM users
        WHERE inActive = 0
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [queryLimit, offset]
    );

    return {
        data: rows,
        pagination: buildPaginationMeta(total, page, queryLimit),
    };
};

/**
 * Update user details
 * @param {string} id
 * @param {Object} updateData
 * @returns {boolean} True if updated
 */
exports.updateUser = async (id, updateData) => {
    const fields = [];
    const values = [];

    for (const key of ["email", "mobile", "userRole", "remarks"]) {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    }

    if (!fields.length) {
        throw new ApiError("No fields to update", 400);
    }

    values.push(id);

    const [result] = await pool.execute(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ? AND inActive = 0`,
        values
    );

    if (!result.affectedRows) {
        throw new ApiError("User not found or unchanged", 404);
    }

    return true;
};

/**
 * Soft delete user
 * @param {string} id
 * @returns {boolean} True if deleted
 */
exports.deleteUser = async (id) => {
    const [result] = await pool.execute(
        "UPDATE users SET inActive = 1 WHERE id = ?",
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("User not found", 404);
    }

    return true;
};
