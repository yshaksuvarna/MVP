const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const sanitizeHtml = require("sanitize-html");

const sanitizeSummary = (summary) => {
    return sanitizeHtml(summary, {
        allowedTags: [
            "p", "ul", "ol", "li", "b", "strong",
            "i", "u", "h3", "h4", "br"
        ],
        allowedAttributes: {}
    });
};

exports.createAffair = async (data) => {
    const {
        title,
        summary,
        category,
        source,
        affairDate,
        tags,
        importance = "Normal",
        isPublished = 1
    } = data;

    const cleanSummary = sanitizeSummary(summary);

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

    return { id: result.insertId };
};

exports.updateAffair = async (id, data) => {
    const {
        title,
        summary,
        category,
        source,
        affairDate,
        tags,
        importance = "Normal",
        isPublished = 1
    } = data;

    const cleanSummary = summary ? sanitizeSummary(summary) : null;

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

    return true;
};

exports.deleteAffair = async (id) => {
    const [result] = await pool.execute(
        `
        UPDATE current_affairs
        SET isDeleted = 1
        WHERE id = ?
        `,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Current affair not found", 404);
    }

    return true;
};

exports.getAffairsList = async ({ date, category, tag, page = 1, limit = 10 }) => {
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

    return rows;
};
