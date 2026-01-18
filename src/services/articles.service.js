const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

/**
 * Create an article with subheadlines in a transaction
 */
exports.createArticle = async ({ headline, content, image, subheadlines }) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Insert Article
        const [articleResult] = await connection.execute(
            `INSERT INTO articles (headline, content, image) VALUES (?, ?, ?)`,
            [headline, content, image || null]
        );
        const articleId = articleResult.insertId;

        // 2. Insert Subheadlines if any (Bulk Insert)
        if (subheadlines && subheadlines.length > 0) {
            const subData = subheadlines.map(sub => [articleId, sub]);
            await connection.query(
                `INSERT INTO article_subheadlines (articleId, subheadline) VALUES ?`,
                [subData]
            );
        }

        await connection.commit();
        return { id: articleId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get list of articles (paginated)
 */
exports.getArticlesList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM articles WHERE inActive = 0`
    );

    const [rows] = await pool.execute(
        `
        SELECT id, headline, image, createdAt
        FROM articles
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
 * Get article with its subheadlines
 */
exports.getArticleById = async (id) => {
    const [[article]] = await pool.execute(
        `SELECT id, headline, content, image, createdAt FROM articles WHERE id = ? AND inActive = 0`,
        [id]
    );

    if (!article) {
        throw new ApiError("Article not found", 404);
    }

    const [subheadlines] = await pool.execute(
        `
        SELECT id, subheadline
        FROM article_subheadlines
        WHERE articleId = ? AND inActive = 0
        `,
        [id]
    );

    article.subheadlines = subheadlines;
    return article;
};

/**
 * Update article and subheadlines in a transaction
 */
exports.updateArticle = async (id, { headline, content, image, subheadlines }) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Update Article metadata
        const [articleUpdate] = await connection.execute(
            `
            UPDATE articles 
            SET headline = ?, content = ?, image = COALESCE(?, image) 
            WHERE id = ? AND inActive = 0
            `,
            [headline, content, image, id]
        );

        if (articleUpdate.affectedRows === 0) {
            throw new ApiError("Article not found", 404);
        }

        // 2. Sync subheadlines: soft delete old and insert new (Bulk Insert)
        if (subheadlines !== undefined && subheadlines.length > 0) {
            await connection.execute(
                `UPDATE article_subheadlines SET inActive = 1 WHERE articleId = ?`,
                [id]
            );

            const subData = subheadlines.map(sub => [id, sub]);
            await connection.query(
                `INSERT INTO article_subheadlines (articleId, subheadline) VALUES ?`,
                [subData]
            );
        } else if (subheadlines !== undefined && subheadlines.length === 0) {
            // If subheadlines array is empty, just mark old ones as inactive
            await connection.execute(
                `UPDATE article_subheadlines SET inActive = 1 WHERE articleId = ?`,
                [id]
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
 * Soft delete article and its subheadlines
 */
exports.deleteArticle = async (id) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [result] = await connection.execute(
            `UPDATE articles SET inActive = 1 WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            throw new ApiError("Article not found", 404);
        }

        await connection.execute(
            `UPDATE article_subheadlines SET inActive = 1 WHERE articleId = ?`,
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
