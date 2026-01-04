const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } =
  require("../utils/pagination.util");
const fs = require("fs");
const path = require("path");

/* ================= CREATE ================= */

exports.create = asyncHandler(async (req, res) => {
  const {
    cityName,
    instituteName,
    address,
    landmark,
    googleMapLink,
  } = req.body;

  if (!cityName || !instituteName || !address) {
    throw new ApiError(
      "cityName, instituteName and address are required",
      400
    );
  }

  // Optional URL validation
  if (googleMapLink && !/^https?:\/\//i.test(googleMapLink)) {
    throw new ApiError("Invalid Google Map link", 400);
  }

  const imagePath = req.file ? req.file.filename : null;

  console.log(req.file?.fieldname);


  const [exists] = await pool.execute(
    `
    SELECT id FROM locations
    WHERE cityName = ? AND instituteName = ? AND inActive = 0
    `,
    [cityName, instituteName]
  );

  if (exists.length) {
    // 🔥 Cleanup uploaded image
    if (req.file) {
      fs.unlink(
        path.join(process.cwd(), imagePath),
        () => { }
      );
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
    [
      cityName,
      instituteName,
      address,
      landmark,
      googleMapLink,
      imagePath,
    ]
  );

  return successResponse(
    res,
    { id: result.insertId },
    "Location created",
    201
  );
});


/* ================= GET ONE ================= */

exports.getOne = asyncHandler(async (req, res) => {
  const [[location]] = await pool.execute(
    `
    SELECT id, cityName, instituteName, address,
           landmark, googleMapLink, image, createdAt
    FROM locations
    WHERE id = ? AND inActive = 0
    `,
    [req.params.id]
  );

  if (!location) {
    throw new ApiError("Location not found", 404);
  }

  return successResponse(res, location);
});

/* ================= LIST (PAGINATED) ================= */

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(
    req.query.page,
    req.query.limit
  );

  // Optional filters (future-proof)
  const filters = ["inActive = 0"];
  const values = [];

  if (req.query.cityName) {
    filters.push("cityName LIKE ?");
    values.push(`%${req.query.cityName}%`);
  }

  if (req.query.instituteName) {
    filters.push("instituteName LIKE ?");
    values.push(`%${req.query.instituteName}%`);
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
    [...values, limit, offset]
  );

  return res.status(200).json({
    success: true,
    message: rows.length ? "Locations list" : "No locations found",
    data: rows,
    pagination: buildPaginationMeta(total, page, limit),
  });
});


/* ================= UPDATE ================= */

exports.update = asyncHandler(async (req, res) => {
  const {
    cityName,
    instituteName,
    address,
    landmark,
    googleMapLink,
  } = req.body;

  const id = req.params.id;

  if (!cityName || !instituteName || !address) {
    throw new ApiError(
      "CityName, InstituteName and Address are required",
      400
    );
  }

  if (googleMapLink && !/^https?:\/\//i.test(googleMapLink)) {
    throw new ApiError("Invalid Google Map link", 400);
  }

  const imagePath = req.file
    ? `/uploads/locations/${req.file.filename}`
    : null;

  const [result] = await pool.execute(
    `UPDATE locations SET cityName = ?, instituteName = ?, address = ?, landmark = ?, googleMapLink = ?, image = ?
     WHERE id = ? AND inActive = 0`,
    [cityName, instituteName, address, landmark, googleMapLink, imagePath, id]
  );

  if (!result.affectedRows) {
    throw new ApiError("Location not found or unchanged", 404);
  }

  return successResponse(res, null, "Location updated");
});

/* ================= DELETE (SOFT) ================= */

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    "UPDATE locations SET inActive = 1 WHERE id = ?",
    [req.params.id]
  );

  if (!result.affectedRows) {
    throw new ApiError("Location not found", 404);
  }

  return successResponse(res, null, "Location deleted");
});

exports.locationSlider = asyncHandler(async (req, res) => {
  const { currentId, direction = "next" } = req.query;

  let navCondition = "";
  let orderBy = "ORDER BY id ASC";
  const values = [];

  // Navigation logic
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

  // 🔹 Fetch one location
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
    return successResponse(res, {
      data: null,
      hasNext: false,
      hasPrev: false,
    }, "No more locations");
  }

  const location = rows[0];

  // 🔹 Check navigation availability
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

  return successResponse(
    res,
    {
      ...location,
      hasNext: Boolean(nav.hasNext),
      hasPrev: Boolean(nav.hasPrev),
    },
    "Location fetched"
  );
});

