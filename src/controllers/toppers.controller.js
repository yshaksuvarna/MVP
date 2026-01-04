const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } =
    require("../utils/pagination.util");

exports.create = asyncHandler(async (req, res) => {
    const { name, achievement } = req.body;

    if (!name || !achievement) {
        throw new ApiError("Name and achievement are required", 400);
    }

    const imagePath = req.file ? req.file.filename : null;

    const [result] = await pool.execute(
        `
        INSERT INTO toppers (name, achievement, image)
        VALUES (?, ?, ?)
        `,
        [name, achievement, imagePath]
    );

    return successResponse(
        res,
        { id: result.insertId },
        "Topper created",
        201
    );
});

exports.getOne = asyncHandler(async (req, res) => {
    const [[topper]] = await pool.execute(
        `
        SELECT id, name, achievement, image, createdAt
        FROM toppers
        WHERE id = ? AND inActive = 0
        `,
        [req.params.id]
    );

    if (!topper) {
        throw new ApiError("Topper not found", 404);
    }

    return successResponse(res, topper);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(
        req.query.page,
        req.query.limit
    );

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
        [limit, offset]
    );

    return res.status(200).json({
        success: true,
        message: rows.length ? "Toppers list" : "No toppers found",
        data: rows,
        pagination: buildPaginationMeta(total, page, limit),
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { name, achievement } = req.body;
    const id = req.params.id;

    if (!name || !achievement) {
        throw new ApiError("Name and achievement are required", 400);
    }

    const imagePath = req.file ? req.file.filename : null;

    const [result] = await pool.execute(
        `
        UPDATE toppers
        SET name = ?, achievement = ?, image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [name, achievement, imagePath, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Topper not found or unchanged", 404);
    }

    return successResponse(res, null, "Topper updated");
});

exports.remove = asyncHandler(async (req, res) => {
    const [result] = await pool.execute(
        `UPDATE toppers SET inActive = 1 WHERE id = ?`,
        [req.params.id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Topper not found", 404);
    }

    return successResponse(res, null, "Topper deleted");
});
