const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const { phone, email, address, googleMapLink } = req.body;

    if (!phone || !email || !address) {
        throw new ApiError("Phone, email and address are required", 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    if (googleMapLink && !/^https?:\/\//i.test(googleMapLink)) {
        throw new ApiError("Invalid Google Map link", 400);
    }

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

    return successResponse(
        res,
        { id: result.insertId },
        "Contact info created",
        201
    );
});

exports.get = asyncHandler(async (req, res) => {
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

    return successResponse(res, contact);
});

exports.update = asyncHandler(async (req, res) => {
    const { phone, email, address, googleMapLink } = req.body;

    if (!phone || !email || !address) {
        throw new ApiError("Phone, email and address are required", 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    if (googleMapLink && !/^https?:\/\//i.test(googleMapLink)) {
        throw new ApiError("Invalid Google Map link", 400);
    }

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

    return successResponse(res, null, "Contact info updated");
});
