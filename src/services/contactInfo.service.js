const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");

exports.createContactInfo = async ({ phone, email, address, googleMapLink }) => {
    const [[exists]] = await pool.execute(
        `SELECT id FROM contact_info LIMIT 1`
    );

    if (exists) {
        throw new ApiError("Contact info already exists. Use update.", 409);
    }

    const [result] = await pool.execute(
        `
        INSERT INTO contact_info (phone, email, address, googleMapLink)
        VALUES (?, ?, ?, ?)
        `,
        [phone, email, address, googleMapLink || null]
    );

    return { id: result.insertId };
};

exports.getContactInfo = async () => {
    const [[contact]] = await pool.execute(
        `
        SELECT phone, email, address, googleMapLink, createdAt
        FROM contact_info
        ORDER BY id DESC
        LIMIT 1
        `
    );

    if (!contact) {
        throw new ApiError("Contact info not found", 404);
    }

    return contact;
};

exports.updateContactInfo = async ({ phone, email, address, googleMapLink }) => {
    // If no record exists, verify logic? The requirement implies update works if it exists.
    // The previous controller had `ORDER BY id DESC LIMIT 1`.

    const [result] = await pool.execute(
        `
        UPDATE contact_info
        SET phone = ?, email = ?, address = ?, googleMapLink = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [phone, email, address, googleMapLink || null]
    );

    if (!result.affectedRows) {
        throw new ApiError("Contact info not found", 404);
    }

    return true;
};
