const sanitizeHtml = require("sanitize-html");
const { validationResult } = require("express-validator");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const {
        title,
        summary,
        category,
        source,
        affairDate,
        tags,
        importance = "Normal",
        isPublished = 1
    } = req.body;

    const cleanSummary = sanitizeHtml(summary, {
        allowedTags: [
            "p", "ul", "ol", "li", "b", "strong",
            "i", "u", "h3", "h4", "br"
        ],
        allowedAttributes: {}
    });

    const [result] = await pool.execute(
        `
        INSERT INTO current_affairs
        (title, summary, category, source, affairDate, tags, importance, isPublished)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            cleanSummary,
            category,
            source,
            affairDate,
            Array.isArray(tags) ? tags.join(",") : tags,
            importance,
            isPublished
        ]
    );

    return successResponse(res, { id: result.insertId }, "Current affair created");
});

exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        title,
        summary,
        category,
        source,
        affairDate,
        tags,
        importance = "Normal",
        isPublished = 1
    } = req.body;

    const cleanSummary = summary
        ? sanitizeHtml(summary, {
            allowedTags: [
                "p", "ul", "ol", "li", "b", "strong",
                "i", "u", "h3", "h4", "br"
            ],
            allowedAttributes: {}
        })
        : null;

    const [result] = await pool.execute(
        `
        UPDATE current_affairs
        SET
            title = ?,
            summary = ?,
            category = ?,
            source = ?,
            affairDate = ?,
            tags = ?,
            importance = ?,
            isPublished = ?
        WHERE id = ? AND isDeleted = 0
        `,
        [
            title,
            cleanSummary,
            category,
            source,
            affairDate,
            Array.isArray(tags) ? tags.join(",") : tags,
            importance,
            isPublished,
            id
        ]
    );

    if (!result.affectedRows) {
        throw new ApiError("Current affair not found", 404);
    }

    return successResponse(res, null, "Current affair updated");
});

exports.remove = asyncHandler(async (req, res) => {
    const [result] = await pool.execute(
        `
        UPDATE current_affairs
        SET isDeleted = 1
        WHERE id = ?
        `,
        [req.params.id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Current affair not found", 404);
    }

    return successResponse(res, null, "Current affair deleted");
});

exports.list = asyncHandler(async (req, res) => {
    const { date, category, tag, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT
            id,
            title,
            summary,
            category,
            source,
            affairDate,
            tags,
            importance,
            createdAt
        FROM current_affairs
        WHERE isPublished = 1
          AND isDeleted = 0
    `;

    const params = [];

    if (date) {
        query += " AND affairDate = ?";
        params.push(date);
    }

    if (category) {
        query += " AND category = ?";
        params.push(category);
    }

    if (tag) {
        query += " AND FIND_IN_SET(?, tags)";
        params.push(tag);
    }

    query += `
        ORDER BY affairDate DESC
        LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);

    return successResponse(res, rows, "Current affairs fetched");
});


