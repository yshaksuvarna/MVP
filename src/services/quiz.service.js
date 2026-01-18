const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

/**
 * Create a new quiz with questions in a transaction
 */
exports.createQuiz = async ({ headline, description, questions }) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Insert Quiz
        const [quizResult] = await connection.execute(
            `INSERT INTO quizzes (headline, description) VALUES (?, ?)`,
            [headline, description || null]
        );
        const quizId = quizResult.insertId;

        // 2. Insert Questions
        for (const q of questions) {
            await connection.execute(
                `
                INSERT INTO questions (quizId, questionText, option1, option2, option3, option4, correctOption)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [quizId, q.questionText, q.option1, q.option2, q.option3, q.option4, q.correctOption]
            );
        }

        await connection.commit();
        return { id: quizId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get list of quizzes (paginated)
 */
exports.getQuizzesList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM quizzes WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, headline, description, createdAt
        FROM quizzes
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
 * Get quiz with its questions
 */
exports.getQuizById = async (id) => {
    const [[quiz]] = await pool.execute(
        `SELECT id, headline, description, createdAt FROM quizzes WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (!quiz) {
        throw new ApiError("Quiz not found", 404);
    }

    const [questions] = await pool.execute(
        `
        SELECT id, questionText, option1, option2, option3, option4, correctOption
        FROM questions
        WHERE quizId = ? AND inActive = 0
        `,
        [id]
    );

    quiz.questions = questions;
    return quiz;
};

/**
 * Update quiz and questions in a transaction
 */
exports.updateQuiz = async (id, { headline, description, questions }) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Update Quiz metadata
        const [quizUpdate] = await connection.execute(
            `UPDATE quizzes SET headline = ?, description = ? WHERE id = ? AND inActive = 0`,
            [headline, description || null, id]
        );

        if (quizUpdate.affectedRows === 0) {
            throw new ApiError("Quiz not found", 404);
        }

        // 2. Simplest sync strategy: Soft delete old questions and insert new ones
        // Alternatively, update if ID exists, but for ease of use from frontend (UI allows adding/removing questions), 
        // we'll mark all old as inactive and insert incoming.
        await connection.execute(
            `UPDATE questions SET inActive = 1 WHERE quizId = ?`,
            [id]
        );

        for (const q of questions) {
            await connection.execute(
                `
                INSERT INTO questions (quizId, questionText, option1, option2, option3, option4, correctOption)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [id, q.questionText, q.option1, q.option2, q.option3, q.option4, q.correctOption]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Soft delete quiz and its questions
 */
exports.deleteQuiz = async (id) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [result] = await connection.execute(
            `UPDATE quizzes SET inActive = 1 WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            throw new ApiError("Quiz not found", 404);
        }

        await connection.execute(
            `UPDATE questions SET inActive = 1 WHERE quizId = ?`,
            [id]
        );

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
