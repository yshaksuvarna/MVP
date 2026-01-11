const courseService = require("../services/course.service");
const { asyncHandler } = require("../middlewares");
const { successResponse } = require("../utils/response");

/* ================= CREATE ================= */
exports.create = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const result = await courseService.createCourse({
        title,
        description,
        duration,
        image: imagePath
    });

    return successResponse(res, result, "Course created successfully", 201);
});


/* ================= LIST ================= */
exports.list = asyncHandler(async (req, res) => {
    const rows = await courseService.getCoursesList();

    return res.status(200).json({
        success: true,
        message: "Courses list",
        data: rows
    });
});

/* ================= GET BY ID ================= */
exports.getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);

    return res.status(200).json({
        success: true,
        data: course
    });
});

/* ================= UPDATE ================= */
exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, duration } = req.body;

    // Check if new image is uploaded, otherwise keep existing logic in service or handle here
    // For simplicity, passing everything. Service uses COALESCE.
    const image = req.file ? req.file.filename : undefined;

    await courseService.updateCourse(id, {
        title,
        description,
        duration,
        image
    });

    return res.status(200).json({
        success: true,
        message: "Course updated successfully"
    });
});

/* ================= DELETE (SOFT) ================= */
exports.remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await courseService.deleteCourse(id);

    return res.status(200).json({
        success: true,
        message: "Course deleted successfully"
    });
});
