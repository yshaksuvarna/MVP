const articlesService = require("../services/articles.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const { headline, content, subheadlines } = req.body;
    const image = req.file ? req.file.filename : null;

    // Parse subheadlines if they come as string (FormData)
    const formattedSubheadlines = typeof subheadlines === 'string'
        ? JSON.parse(subheadlines)
        : subheadlines;

    const result = await articlesService.createArticle({
        headline,
        content,
        image,
        subheadlines: formattedSubheadlines
    });

    return successResponse(res, result, "Article created successfully", 201);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await articlesService.getArticlesList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "Articles list" : "No articles found",
        ...result
    });
});

exports.getById = asyncHandler(async (req, res) => {
    const article = await articlesService.getArticleById(req.params.id);
    return successResponse(res, article);
});

exports.update = asyncHandler(async (req, res) => {
    const { headline, content, subheadlines } = req.body;
    const id = req.params.id;
    const image = req.file ? req.file.filename : undefined;

    const formattedSubheadlines = subheadlines && typeof subheadlines === 'string'
        ? JSON.parse(subheadlines)
        : subheadlines;

    await articlesService.updateArticle(id, {
        headline,
        content,
        image,
        subheadlines: formattedSubheadlines
    });

    return successResponse(res, null, "Article updated successfully");
});

exports.remove = asyncHandler(async (req, res) => {
    await articlesService.deleteArticle(req.params.id);
    return successResponse(res, null, "Article deleted successfully");
});
