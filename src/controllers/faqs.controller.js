const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } =
    require("../utils/pagination.util");

exports.create = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        throw new ApiError("Question and answer are required", 400);
    }

    const [result] = await pool.execute(
        `
        INSERT INTO faqs (question, answer)
        VALUES (?, ?)
        `,
        [question, answer]
    );

    return successResponse(
        res,
        { id: result.insertId },
        "FAQ created",
        201
    );
});

exports.getOne = asyncHandler(async (req, res) => {
    const [[faq]] = await pool.execute(
        `
        SELECT id, question, answer, createdAt
        FROM faqs
        WHERE id = ? AND inActive = 0
        `,
        [req.params.id]
    );

    if (!faq) {
        throw new ApiError("FAQ not found", 404);
    }

    return successResponse(res, faq);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(
        req.query.page,
        req.query.limit
    );

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM faqs WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, question, answer, createdAt
        FROM faqs
        WHERE inActive = 0
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
    );

    return res.status(200).json({
        success: true,
        message: rows.length ? "FAQs list" : "No FAQs found",
        data: rows,
        pagination: buildPaginationMeta(total, page, limit),
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    const id = req.params.id;

    if (!question || !answer) {
        throw new ApiError("Question and answer are required", 400);
    }

    const [result] = await pool.execute(
        `
        UPDATE faqs
        SET question = ?, answer = ?
        WHERE id = ? AND inActive = 0
        `,
        [question, answer, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("FAQ not found or unchanged", 404);
    }

    return successResponse(res, null, "FAQ updated");
});

exports.remove = asyncHandler(async (req, res) => {
    const [result] = await pool.execute(
        `UPDATE faqs SET inActive = 1 WHERE id = ?`,
        [req.params.id]
    );

    if (!result.affectedRows) {
        throw new ApiError("FAQ not found", 404);
    }

    return successResponse(res, null, "FAQ deleted");
});
