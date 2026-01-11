const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination.util");
const fs = require("fs");
const path = require("path");

exports.createLocation = async (data) => {
    const { cityName, instituteName, address, landmark, googleMapLink, image } = data;

    const [exists] = await pool.execute(
        `
        SELECT id FROM locations
        WHERE cityName = ? AND instituteName = ? AND inActive = 0
        `,
        [cityName, instituteName]
    );

    if (exists.length) {
        // Cleanup uploaded image if duplicate exists
        if (image) {
            fs.unlink(path.join(process.cwd(), image), () => { });
        }
        throw new ApiError("Location already exists", 409);
    }

    const [result] = await pool.execute(
        `
        INSERT INTO locations (
            cityName, instituteName, address,
            landmark, googleMapLink, image
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [cityName, instituteName, address, landmark, googleMapLink || null, image || null]
    );

    return { id: result.insertId };
};

exports.getLocationById = async (id) => {
    const [[location]] = await pool.execute(
        `
        SELECT id, cityName, instituteName, address,
               landmark, googleMapLink, image, createdAt
        FROM locations
        WHERE id = ? AND inActive = 0
        `,
        [id]
    );

    if (!location) {
        throw new ApiError("Location not found", 404);
    }

    return location;
};

exports.getLocationsList = async (query) => {
    const { page, limit } = query;
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const filters = ["inActive = 0"];
    const values = [];

    if (query.cityName) {
        filters.push("cityName LIKE ?");
        values.push(`%${query.cityName}%`);
    }

    if (query.instituteName) {
        filters.push("instituteName LIKE ?");
        values.push(`%${query.instituteName}%`);
    }

    const whereClause = filters.join(" AND ");

    const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM locations WHERE ${whereClause}`,
        values
    );

    const [rows] = await pool.execute(
        `
        SELECT id, cityName, instituteName, address,
               landmark, googleMapLink, image, createdAt
        FROM locations
        WHERE ${whereClause}
        ORDER BY cityName, instituteName, id
        LIMIT ? OFFSET ?
        `,
        [...values, queryLimit, offset]
    );

    return {
        data: rows,
        pagination: buildPaginationMeta(total, page, queryLimit),
    };
};

exports.updateLocation = async (id, data) => {
    const { cityName, instituteName, address, landmark, googleMapLink, image } = data;

    // Use COALESCE for image to keep existing if not provided
    // BUT we need to handle the path logic.
    // In service we assume raw values. Controller prepares the path.

    const [result] = await pool.execute(
        `
        UPDATE locations
        SET cityName = ?, instituteName = ?, address = ?, landmark = ?, googleMapLink = ?, image = COALESCE(?, image)
        WHERE id = ? AND inActive = 0
        `,
        [cityName, instituteName, address, landmark, googleMapLink || null, image, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Location not found or unchanged", 404);
    }

    return true;
};

exports.deleteLocation = async (id) => {
    const [result] = await pool.execute(
        "UPDATE locations SET inActive = 1 WHERE id = ?",
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Location not found", 404);
    }

    return true;
};

exports.getLocationSlider = async (query) => {
    const { currentId, direction = "next" } = query;

    let navCondition = "";
    let orderBy = "ORDER BY id ASC";
    const values = [];

    if (currentId) {
        if (direction === "next") {
            navCondition = "AND id > ?";
            orderBy = "ORDER BY id ASC";
            values.push(Number(currentId));
        } else {
            navCondition = "AND id < ?";
            orderBy = "ORDER BY id DESC";
            values.push(Number(currentId));
        }
    }

    const [rows] = await pool.execute(
        `
        SELECT
          id, cityName, instituteName, address, landmark, googleMapLink, image, createdAt
        FROM locations
        WHERE inActive = 0
        ${navCondition}
        ${orderBy}
        LIMIT 1
        `,
        values
    );

    if (!rows.length) {
        return { data: null, hasNext: false, hasPrev: false };
    }

    const location = rows[0];

    const [[nav]] = await pool.execute(
        `
        SELECT
          EXISTS (
            SELECT 1 FROM locations
            WHERE inActive = 0 AND id > ?
          ) AS hasNext,
          EXISTS (
            SELECT 1 FROM locations
            WHERE inActive = 0 AND id < ?
          ) AS hasPrev
        `,
        [location.id, location.id]
    );

    return {
        ...location,
        hasNext: Boolean(nav.hasNext),
        hasPrev: Boolean(nav.hasPrev),
    };
};
