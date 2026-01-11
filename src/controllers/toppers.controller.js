const toppersService = require("../services/toppers.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const { name, achievement } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const result = await toppersService.createTopper({
        name,
        achievement,
        image: imagePath
    });

    return successResponse(res, result, "Topper created", 201);
});

exports.getOne = asyncHandler(async (req, res) => {
    const topper = await toppersService.getTopperById(req.params.id);
    return successResponse(res, topper);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await toppersService.getToppersList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "Toppers list" : "No toppers found",
        ...result
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { name, achievement } = req.body;
    const id = req.params.id;

    // Check if new image is uploaded, otherwise keep existing logic in service or handle here
    // For simplicity, passing everything. Service uses COALESCE.
    const image = req.file ? req.file.filename : undefined;

    await toppersService.updateTopper(id, {
        name,
        achievement,
        image
    });

    return successResponse(res, null, "Topper updated");
});

exports.remove = asyncHandler(async (req, res) => {
    await toppersService.deleteTopper(req.params.id);
    return successResponse(res, null, "Topper deleted");
});
