const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

exports.createNote = async ({ headline, description, file }) => {
    const [result] = await pool.execute(
        `INSERT INTO notes (headline, description, file) VALUES (?, ?, ?)`,
        [headline, description || null, file || null]
    );

    return { id: result.insertId };
};

exports.getNotesList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM notes WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, headline, description, file, createdAt
        FROM notes
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

exports.getNoteById = async (id) => {
    const [[note]] = await pool.execute(
        `SELECT id, headline, description, file, createdAt FROM notes WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (!note) {
        throw new ApiError("Note not found", 404);
    }

    return note;
};

exports.updateNote = async (id, { headline, description, file }) => {
    const [result] = await pool.execute(
        `
        UPDATE notes
        SET headline = ?, description = ?, file = COALESCE(?, file)
        WHERE id = ? AND inActive = 0
        `,
        [headline, description || null, file, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Note not found", 404);
    }

    return true;
};

exports.deleteNote = async (id) => {
    const [result] = await pool.execute(
        `UPDATE notes SET inActive = 1 WHERE id = ?`,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Note not found", 404);
    }

    return true;
};
