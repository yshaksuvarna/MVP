const router = require("express").Router();
const courseController = require("../../controllers/course.controller");
const { createUploader } = require("../../middlewares");
const validate = require("../../middlewares/validate.middleware");
const { courseValidator } = require("../../validators/course.validator");

const uploadCourseImage = createUploader({
  folder: "courses",
  fieldName: "image",
  maxSizeMB: 5,
});

router.get("/", courseController.list);
router.get("/:id", courseController.getById);
router.post("/", uploadCourseImage, courseValidator, validate, courseController.create);
router.put("/:id", uploadCourseImage, courseValidator, validate, courseController.update);
router.delete("/:id", courseController.remove);

module.exports = router;
