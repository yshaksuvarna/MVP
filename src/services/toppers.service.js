const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

/**
 * Create a new topper
 * @param {Object} topperData
 * @returns {Object} Created topper ID
 */
exports.createTopper = async ({ name, achievement, image }) => {
    const [result] = await pool.execute(
        `
        INSERT INTO toppers (name, achievement, image)
        VALUES (?, ?, ?)
        `,
        [name, achievement, image || null]
    );

    return { id: result.insertId };
};

/**
 * Get list of toppers with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Object} List of toppers and pagination meta
 */
exports.getToppersList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM toppers WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, name, achievement, image, createdAt
        FROM toppers
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
 * Get topper by ID
 * @param {string} id
 * @returns {Object} Topper data
 */
exports.getTopperById = async (id) => {
    const [[topper]] = await pool.execute(
        `
        SELECT id, name, achievement, image, createdAt
        FROM toppers
        WHERE id = ? AND inActive = 0
        `,
        [id]
    );

    if (!topper) {
        throw new ApiError("Topper not found", 404);
    }

    return topper;
};

/**
 * Update topper
 * @param {string} id
 * @param {Object} updateData
 * @returns {boolean} True if updated
 */
exports.updateTopper = async (id, { name, achievement, image }) => {
    const [result] = await pool.execute(
        `
        UPDATE toppers
        SET name = ?, achievement = ?, image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [name, achievement, image, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Topper not found or unchanged", 404);
    }

    return true;
};

/**
 * Soft delete topper
 * @param {string} id
 * @returns {boolean} True if deleted
 */
exports.deleteTopper = async (id) => {
    const [result] = await pool.execute(
        `UPDATE toppers SET inActive = 1 WHERE id = ?`,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Topper not found", 404);
    }

    return true;
};
