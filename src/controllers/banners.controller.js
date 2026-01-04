const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } =
    require("../utils/pagination.util");

exports.create = asyncHandler(async (req, res) => {
    const { title, subTitle } = req.body;

    if (!title) {
        throw new ApiError("Banner title is required", 400);
    }

    const imagePath = req.file ? req.file.filename : null;

    const [result] = await pool.execute(
        `
        INSERT INTO banners (title, subTitle, image)
        VALUES (?, ?, ?)
        `,
        [title, subTitle || null, imagePath]
    );

    return successResponse(
        res,
        { id: result.insertId },
        "Banner created",
        201
    );
});

exports.getOne = asyncHandler(async (req, res) => {
    const [[banner]] = await pool.execute(
        `
        SELECT id, title, subTitle, image, createdAt
        FROM banners
        WHERE id = ? AND inActive = 0
        `,
        [req.params.id]
    );

    if (!banner) {
        throw new ApiError("Banner not found", 404);
    }

    return successResponse(res, banner);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(
        req.query.page,
        req.query.limit
    );

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM banners WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, title, subTitle, image, createdAt
        FROM banners
        WHERE inActive = 0
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    return res.status(200).json({
        success: true,
        message: rows.length ? "Banners list" : "No banners found",
        data: rows,
        pagination: buildPaginationMeta(total, page, limit),
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { title, subTitle } = req.body;
    const id = req.params.id;

    if (!title) {
        throw new ApiError("Banner title is required", 400);
    }

    const imagePath = req.file ? req.file.filename : null;

    const [result] = await pool.execute(
        `
        UPDATE banners
        SET title = ?, subTitle = ?, image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [title, subTitle || null, imagePath, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Banner not found or unchanged", 404);
    }

    return successResponse(res, null, "Banner updated");
});

exports.remove = asyncHandler(async (req, res) => {
    const [result] = await pool.execute(
        `UPDATE banners SET inActive = 1 WHERE id = ?`,
        [req.params.id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Banner not found", 404);
    }

    return successResponse(res, null, "Banner deleted");
});
