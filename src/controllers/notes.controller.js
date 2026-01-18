const notesService = require("../services/notes.service");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { successResponse } = require("../utils/response");

exports.create = asyncHandler(async (req, res) => {
    const { headline, description } = req.body;
    const filePath = req.file ? req.file.filename : null;

    const result = await notesService.createNote({
        headline,
        description,
        file: filePath
    });

    return successResponse(res, result, "Note uploaded successfully", 201);
});

exports.list = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await notesService.getNotesList(page, limit);

    return res.status(200).json({
        success: true,
        message: result.data.length ? "Notes list" : "No notes found",
        ...result
    });
});

exports.getOne = asyncHandler(async (req, res) => {
    const note = await notesService.getNoteById(req.params.id);
    return successResponse(res, note);
});

exports.update = asyncHandler(async (req, res) => {
    const { headline, description } = req.body;
    const id = req.params.id;
    const file = req.file ? req.file.filename : undefined;

    await notesService.updateNote(id, {
        headline,
        description,
        file
    });

    return successResponse(res, null, "Note updated successfully");
});

exports.remove = asyncHandler(async (req, res) => {
    await notesService.deleteNote(req.params.id);
    return successResponse(res, null, "Note deleted successfully");
});
