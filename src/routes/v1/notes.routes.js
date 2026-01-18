const router = require("express").Router();
const notesController = require("../../controllers/notes.controller");
const { createUploader } = require("../../middlewares");
const validate = require("../../middlewares/validate.middleware");
const { noteValidator } = require("../../validators/notes.validator");

const uploadNote = createUploader({
    folder: "notes",
    fieldName: "file",
    allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    maxSizeMB: 10,
});

router.post("/", uploadNote, noteValidator, validate, notesController.create);
router.get("/", notesController.list);
router.get("/:id", notesController.getOne);
router.put("/:id", uploadNote, noteValidator, validate, notesController.update);
router.delete("/:id", notesController.remove);

module.exports = router;
