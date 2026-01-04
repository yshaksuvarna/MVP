const { pool } = require("../config/db");
const { asyncHandler } = require("../middlewares");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");

/* ================= CREATE ================= */
exports.create = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;

    if (!title) {
        throw new ApiError("Title is required", 400);
    }

    const imagePath = req.file ? req.file.filename : null;

    await pool.execute(
        `
        INSERT INTO courses (title, description, duration, image)
        VALUES (?, ?, ?, ?)
        `,
        [title, description || null, duration || null, imagePath]
    );

    return successResponse(res, null, "Course created successfully");
});


/* ================= LIST ================= */
exports.list = asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(`
        SELECT id, title, description, duration, image, createdAt
        FROM courses
        WHERE inActive = 0
        ORDER BY createdAt DESC
    `);

    return res.status(200).json({
        success: true,
        message: "Courses list",
        data: rows
    });
});

/* ================= GET BY ID ================= */
exports.getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [[course]] = await pool.execute(
        `SELECT id, title, description, duration, image
         FROM courses
         WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (!course) {
        throw new CustomError("Course not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: course
    });
});

/* ================= UPDATE ================= */
exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, duration, image } = req.body;

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
        throw new CustomError("Course not found or already deleted", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Course updated successfully"
    });
});

/* ================= DELETE (SOFT) ================= */
exports.remove = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [result] = await pool.execute(
        `UPDATE courses SET inActive = 1 WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (result.affectedRows === 0) {
        throw new CustomError("Course not found", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Course deleted successfully"
    });
});
