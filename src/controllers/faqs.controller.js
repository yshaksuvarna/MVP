const faqsService = require("../services/faqs.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const result = await faqsService.createFaq(req.body);
    return successResponse(res, result, "FAQ created", 201);
});

exports.getOne = asyncHandler(async (req, res) => {
    const faq = await faqsService.getFaqById(req.params.id);
    return successResponse(res, faq);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await faqsService.getFaqsList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "FAQs list" : "No FAQs found",
        ...result
    });
});

exports.update = asyncHandler(async (req, res) => {
    await faqsService.updateFaq(req.params.id, req.body);
    return successResponse(res, null, "FAQ updated");
});

exports.remove = asyncHandler(async (req, res) => {
    await faqsService.deleteFaq(req.params.id);
    return successResponse(res, null, "FAQ deleted");
});
