const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");

/**
 * Create a new course
 * @param {Object} courseData
 * @returns {Object} Created course ID
 */
exports.createCourse = async ({ title, description, duration, image }) => {
    const [result] = await pool.execute(
        `
        INSERT INTO courses (title, description, duration, image)
        VALUES (?, ?, ?, ?)
        `,
        [title, description || null, duration || null, image || null]
    );

    return { id: result.insertId };
};

/**
 * Get list of courses
 * @returns {Array} List of courses
 */
exports.getCoursesList = async () => {
    const [rows] = await pool.execute(`
        SELECT id, title, description, duration, image, createdAt
        FROM courses
        WHERE inActive = 0
        ORDER BY createdAt DESC
    `);
    return rows;
};

/**
 * Get course by ID
 * @param {string} id
 * @returns {Object} Course data
 */
exports.getCourseById = async (id) => {
    const [[course]] = await pool.execute(
        `SELECT id, title, description, duration, image
         FROM courses
         WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (!course) {
        throw new ApiError("Course not found", 404);
    }

    return course;
};

/**
 * Update course
 * @param {string} id
 * @param {Object} updateData
 * @returns {boolean} True if updated
 */
exports.updateCourse = async (id, { title, description, duration, image }) => {
    const [result] = await pool.execute(
        `
        UPDATE courses
        SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            duration = COALESCE(?, duration),
            image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [title, description, duration, image, id]
    );

    if (result.affectedRows === 0) {
        throw new ApiError("Course not found or already deleted", 404);
    }

    return true;
};

/**
 * Soft delete course
 * @param {string} id
 * @returns {boolean} True if deleted
 */
exports.deleteCourse = async (id) => {
    const [result] = await pool.execute(
        `UPDATE courses SET inActive = 1 WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (result.affectedRows === 0) {
        throw new ApiError("Course not found", 404);
    }

    return true;
};
