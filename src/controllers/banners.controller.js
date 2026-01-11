const bannersService = require("../services/banners.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const { title, subTitle } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const result = await bannersService.createBanner({
        title,
        subTitle,
        image: imagePath
    });

    return successResponse(res, result, "Banner created", 201);
});

exports.getOne = asyncHandler(async (req, res) => {
    const banner = await bannersService.getBannerById(req.params.id);
    return successResponse(res, banner);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await bannersService.getBannersList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "Banners list" : "No banners found",
        ...result
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { title, subTitle } = req.body;
    const id = req.params.id;
    const image = req.file ? req.file.filename : undefined;

    await bannersService.updateBanner(id, {
        title,
        subTitle,
        image
    });

    return successResponse(res, null, "Banner updated");
});

exports.remove = asyncHandler(async (req, res) => {
    await bannersService.deleteBanner(req.params.id);
    return successResponse(res, null, "Banner deleted");
});
