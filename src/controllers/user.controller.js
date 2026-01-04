const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");
const bcrypt = require("bcrypt");
const { getPagination, buildPaginationMeta } =
  require("../utils/pagination.util");

exports.create = asyncHandler(async (req, res) => {
  const user = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [exists] = await conn.execute(
      "SELECT id FROM users WHERE userName = ? OR email = ?",
      [user.userName, user.email]
    );

    if (exists.length) {
      throw new ApiError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const [result] = await conn.execute(
      `
      INSERT INTO users (
        userName, email, password, mobile, userRole, inActive
      ) VALUES (?, ?, ?, ?, ?, 0)
      `,
      [
        user.userName,
        user.email,
        hashedPassword,
        user.mobile,
        user.userRole || "USER",
      ]
    );

    await conn.commit();

    return successResponse(res, { id: result.insertId }, "User created", 201);

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

exports.getOne = asyncHandler(async (req, res) => {
  const [[user]] = await pool.execute(
    `
    SELECT id, userName, email, mobile, userRole,
        createdAt
    FROM users
    WHERE id = ? AND inActive = 0
    `,
    [req.params.id]
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return successResponse(res, user);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(
    req.query.page,
    req.query.limit
  );

  const [[{ total }]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM users WHERE inActive = 0"
  );

  const [rows] = await pool.execute(
    `
    SELECT id, userName, email, mobile, userRole, createdAt
    FROM users
    WHERE inActive = 0
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return res.status(200).json({
    success: true,
    message: 'Users list',
    data: rows,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

exports.update = asyncHandler(async (req, res) => {
  const fields = [];
  const values = [];

  for (const key of ["email", "mobile", "userRole", "remarks"]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (!fields.length) {
    throw new ApiError("No fields to update", 400);
  }

  values.push(req.params.id);

  const [result] = await pool.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ? AND inActive = 0`,
    values
  );

  if (!result.affectedRows) {
    throw new ApiError("User not found or unchanged", 404);
  }

  return successResponse(res, null, "User updated");
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    "UPDATE users SET inActive = 1 WHERE id = ?",
    [req.params.id]
  );

  if (!result.affectedRows) {
    throw new ApiError("User not found", 404);
  }

  return successResponse(res, null, "User deleted");
});
