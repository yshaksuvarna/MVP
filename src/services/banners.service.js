const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");

exports.createBanner = async ({ title, subTitle, image }) => {
    const [result] = await pool.execute(
        `
        INSERT INTO banners (title, subTitle, image)
        VALUES (?, ?, ?)
        `,
        [title, subTitle || null, image || null]
    );

    return { id: result.insertId };
};

exports.getBannersList = async (page, limit) => {
    const { limit: queryLimit, offset } = getPagination(page, limit);

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
        [queryLimit, offset]
    );

    return {
        data: rows,
        pagination: buildPaginationMeta(total, page, queryLimit),
    };
};

exports.getBannerById = async (id) => {
    const [[banner]] = await pool.execute(
        `
        SELECT id, title, subTitle, image, createdAt
        FROM banners
        WHERE inActive = 0
        `,
        [id]
    );

    if (!banner) {
        throw new ApiError("Banner not found", 404);
    }

    return banner;
};

exports.updateBanner = async (id, { title, subTitle, image }) => {
    const [result] = await pool.execute(
        `
        UPDATE banners
        SET title = ?, subTitle = ?, image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [title, subTitle || null, image, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Banner not found or unchanged", 404);
    }

    return true;
};

exports.deleteBanner = async (id) => {
    const [result] = await pool.execute(
        `UPDATE banners SET inActive = 1 WHERE id = ?`,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Banner not found", 404);
    }

    return true;
};
