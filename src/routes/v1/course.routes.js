const router = require("express").Router();
const courseController = require("../../controllers/course.controller");
const { createUploader } = require("../../middlewares");

const uploadCourseImage = createUploader({
  folder: "courses",
  fieldName: "image",
  maxSizeMB: 5,
});

router.get("/", courseController.list);
router.get("/:id", courseController.getById);
router.post("/", uploadCourseImage, courseController.create);
router.put("/:id", courseController.update);
router.delete("/:id", courseController.remove);

module.exports = router;
