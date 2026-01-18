const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");

exports.createContactInfo = async ({ phone, email, address, googleMapLink }) => {
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
    const [rows] = await pool.execute(
        `
        SELECT id, phone, email, address, googleMapLink, createdAt
        FROM contact_info
        ORDER BY id DESC
        `
    );

    return rows;
};

exports.updateContactInfo = async (id, { phone, email, address, googleMapLink }) => {
    const [result] = await pool.execute(
        `
        UPDATE contact_info
        SET phone = ?, email = ?, address = ?, googleMapLink = ?
        WHERE id = ?
        `,
        [phone, email, address, googleMapLink || null, id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Contact info not found", 404);
    }

    return true;
};

exports.deleteContactInfo = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM contact_info WHERE id = ?`,
        [id]
    );

    if (!result.affectedRows) {
        throw new ApiError("Contact info not found", 404);
    }

    return true;
};
