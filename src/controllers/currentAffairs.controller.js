const currentAffairsService = require("../services/currentAffairs.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const result = await currentAffairsService.createAffair(req.body);
    return successResponse(res, result, "Current affair created");
});

exports.update = asyncHandler(async (req, res) => {
    await currentAffairsService.updateAffair(req.params.id, req.body);
    return successResponse(res, null, "Current affair updated");
});

exports.remove = asyncHandler(async (req, res) => {
    await currentAffairsService.deleteAffair(req.params.id);
    return successResponse(res, null, "Current affair deleted");
});

exports.list = asyncHandler(async (req, res) => {
    const rows = await currentAffairsService.getAffairsList(req.query);
    return successResponse(res, rows, "Current affairs fetched");
});


