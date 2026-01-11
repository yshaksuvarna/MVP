const contactInfoService = require("../services/contactInfo.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const result = await contactInfoService.createContactInfo(req.body);
    return successResponse(res, result, "Contact info created", 201);
});

exports.get = asyncHandler(async (req, res) => {
    const contact = await contactInfoService.getContactInfo();
    return successResponse(res, contact);
});

exports.update = asyncHandler(async (req, res) => {
    await contactInfoService.updateContactInfo(req.body);
    return successResponse(res, null, "Contact info updated");
});
