const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

exports.createFaq = async (data) => {
    const { question, answer } = data;

    const [result] = await pool.execute(
        `
        INSERT INTO faqs (question, answer)
        VALUES (?, ?)
        `,
        [question, answer]
    );

    return { id: result.insertId };
};

exports.getFaqsList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

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
        [queryLimit, offset]
    );

    return {
        data: rows,
        pagination: buildPaginationMeta(total, page, queryLimit),
    };
};

exports.getFaqById = async (id) => {
    const [[faq]] = await pool.execute(
        `
        SELECT id, question, answer, createdAt
        FROM faqs
        WHERE id = ? AND inActive = 0
        `,
        [id]
    );

    if (!faq) {
        throw new ApiError("FAQ not found", 404);
    }

    return faq;
};

exports.updateFaq = async (id, data) => {
    const { question, answer } = data;

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

    return true;
};

exports.deleteFaq = async (id) => {
    const [result] = await pool.execute(
        `UPDATE faqs SET inActive = 1 WHERE id = ?`,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("FAQ not found", 404);
    }

    return true;
};
