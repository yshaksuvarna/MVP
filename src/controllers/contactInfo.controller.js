const contactInfoService = require("../services/contactInfo.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const result = await contactInfoService.createContactInfo(req.body);
    return successResponse(res, result, "Contact info created", 201);
});

exports.get = asyncHandler(async (req, res) => {
    const contacts = await contactInfoService.getContactInfo();
    return res.status(200).json({
        success: true,
        message: contacts.length ? "Contact info list" : "No contact info found",
        data: contacts
    });
});

exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await contactInfoService.updateContactInfo(id, req.body);
    return successResponse(res, null, "Contact info updated");
});

exports.remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await contactInfoService.deleteContactInfo(id);
    return successResponse(res, null, "Contact info deleted");
});
