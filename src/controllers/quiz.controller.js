const quizService = require("../services/quiz.service");
const { asyncHandler } = require("../middlewares");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const result = await quizService.createQuiz(req.body);
    return successResponse(res, result, "Quiz created successfully", 201);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await quizService.getQuizzesList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "Quizzes list" : "No quizzes found",
        ...result
    });
});

exports.getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const quiz = await quizService.getQuizById(id);
    return successResponse(res, quiz);
});

exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await quizService.updateQuiz(id, req.body);
    return successResponse(res, null, "Quiz updated successfully");
});

exports.remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await quizService.deleteQuiz(id);
    return successResponse(res, null, "Quiz deleted successfully");
});
